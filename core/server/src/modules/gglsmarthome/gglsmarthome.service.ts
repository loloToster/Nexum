import { randomBytes } from "crypto"
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common"
import { google } from "googleapis"
import { User } from "@prisma/client"

import { FullGglDevice } from "src/types/types"

import { DatabaseService } from "src/modules/database/database.service"

import {
  EditGoogleSmarthomeDeviceDto,
  NewGoogleSmarthomeDeviceDto
} from "src/dtos/googleSmarthomeDevice.dto"
import { ValueService } from "../value/value.service"

import { CmdToVal, supportedTraits } from "./ggl-value-maps"

const {
  GOOGLE_SMARTHOME_PROJECT_ID,
  GOOGLE_HOMEGRAPH_KEY_ID,
  GOOGLE_HOMEGRAPH_KEY,
  GOOGLE_HOMEGRAPH_CLIENT_EMAIL,
  GOOGLE_HOMEGRAPH_CLIENT_ID
} = process.env

const homegraphClient = google.homegraph({
  version: "v1",
  auth: new google.auth.GoogleAuth({
    scopes: "https://www.googleapis.com/auth/homegraph",
    credentials: {
      type: "service_account",
      universe_domain: "googleapis.com",
      project_id: GOOGLE_SMARTHOME_PROJECT_ID,
      private_key_id: GOOGLE_HOMEGRAPH_KEY_ID,
      private_key: GOOGLE_HOMEGRAPH_KEY,
      client_email: GOOGLE_HOMEGRAPH_CLIENT_EMAIL,
      client_id: GOOGLE_HOMEGRAPH_CLIENT_ID
    }
  })
})

function createCode(size = 64) {
  return randomBytes(size).toString("hex")
}

function getNowWithOffset(offset: number) {
  return new Date(new Date().getTime() + offset)
}

function parseExpiryDate(expires: Date) {
  return Math.round((expires.getTime() - new Date().getTime()) / 1000)
}

@Injectable()
export class GoogleSmarthomeService {
  private readonly logger = new Logger(GoogleSmarthomeService.name)

  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => ValueService))
    private valueService: ValueService
  ) {}

  async generateCodeForUser(id: string) {
    const codeData = {
      code: createCode(),
      codeExpires: getNowWithOffset(10 * 60 * 1000)
    }

    const gglSmarthomeIntegration =
      await this.db.googleSmartHomeIntegration.upsert({
        where: { userId: id },
        update: codeData,
        create: { ...codeData, userId: id }
      })

    return gglSmarthomeIntegration.code
  }

  async generateTokensFromCode(code: string) {
    let integration =
      await this.db.googleSmartHomeIntegration.findUniqueOrThrow({
        where: { code }
      })

    if (integration.codeExpires.getTime() < new Date().getTime()) {
      throw new BadRequestException()
    }

    integration = await this.db.googleSmartHomeIntegration.update({
      where: { code },
      data: {
        code: null,
        codeExpires: null,
        accessToken: createCode(),
        refreshToken: createCode(),
        accessTokenExpires: getNowWithOffset(60 * 60 * 1000)
      }
    })

    return {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      expiresIn: parseExpiryDate(integration.accessTokenExpires)
    }
  }

  async refreshAccessToken(refreshToken: string) {
    let integration =
      await this.db.googleSmartHomeIntegration.findUniqueOrThrow({
        where: { refreshToken }
      })

    integration = await this.db.googleSmartHomeIntegration.update({
      where: { id: integration.id },
      data: {
        accessToken: createCode(),
        accessTokenExpires: getNowWithOffset(60 * 60 * 1000)
      }
    })

    return {
      accessToken: integration.accessToken,
      expiresIn: parseExpiryDate(integration.accessTokenExpires)
    }
  }

  async getUserGoogleDevices(userId: string) {
    const devices = await this.db.googlehomeDevice.findMany({
      where: { integration: { userId } },
      include: { traits: { include: { targets: true } } }
    })

    return devices
  }

  async requestSync(userId: string) {
    try {
      return await homegraphClient.devices.requestSync({
        requestBody: { agentUserId: userId, async: false }
      })
    } catch (err) {
      this.logger.error(err)
      return err
    }
  }

  async createNewDevice(userId: string, device: NewGoogleSmarthomeDeviceDto) {
    const newDevice = await this.db.googlehomeDevice.create({
      data: {
        integration: { connect: { userId } },
        name: device.name,
        type: device.type,
        traits: {
          create: device.traits.map(trait => ({
            name: trait.name,
            targets: { create: trait.targets }
          }))
        }
      },
      include: { traits: { include: { targets: true } } }
    })

    await this.requestSync(userId)

    return newDevice
  }

  async removeDevice(userId: string, deviceId: number) {
    await this.db.googlehomeDevice.deleteMany({
      where: { AND: [{ id: deviceId }, { integration: { userId } }] }
    })

    await this.requestSync(userId)
  }

  async editDevice(userId: string, editedDevice: EditGoogleSmarthomeDeviceDto) {
    const devices = await this.db.googlehomeDevice.findMany({
      where: { AND: [{ id: editedDevice.id }, { integration: { userId } }] }
    })

    if (devices.length !== 1) throw new ForbiddenException()

    await this.db.$transaction([
      this.db.googlehomeDeviceTrait.deleteMany({
        where: { googleDeviceId: editedDevice.id }
      }),
      this.db.googlehomeDevice.update({
        where: { id: editedDevice.id },
        data: {
          name: editedDevice.name,
          type: editedDevice.type,
          traits: {
            create: editedDevice.traits.map(trait => ({
              name: trait.name,
              targets: { create: trait.targets }
            }))
          }
        }
      })
    ])

    await this.requestSync(userId)
  }

  // INTENTS

  async handleIntent(intent: string, payload: any, body: any, user: User) {
    switch (intent) {
      case "action.devices.SYNC": {
        const devices = await this.getUserGoogleDevices(user.id)

        return {
          requestId: body.requestId,
          payload: {
            agentUserId: user.id,
            devices: devices.map(device => {
              let attributes = {}

              device.traits.forEach(trait => {
                attributes = {
                  attributes,
                  ...supportedTraits[trait.name]?.attributes
                }
              })

              return {
                id: device.id.toString(),
                type: `action.devices.types.${device.type}`,
                traits: device.traits.map(
                  trait => `action.devices.traits.${trait.name}`
                ),
                name: { name: device.name },
                willReportState: true,
                attributes
              }
            })
          }
        }
      }

      case "action.devices.QUERY": {
        const gglDevicesIds: number[] = payload.devices.map(d => parseInt(d.id))

        let gglDevices = await this.getUserGoogleDevices(user.id)
        gglDevices = gglDevices.filter(d => gglDevicesIds.includes(d.id))

        const queryDevices: Record<string, any> = {}

        for (const device of gglDevices) {
          queryDevices[device.id.toString()] = {
            online: true,
            status: "SUCCESS",
            ...(await this.getDeviceState(device))
          }
        }

        return {
          requestId: body.requestId,
          payload: {
            devices: queryDevices
          }
        }
      }

      case "action.devices.EXECUTE": {
        const gglDevices = await this.getUserGoogleDevices(user.id)
        const affectedDevices: string[] = []

        for (const command of payload.commands) {
          for (const device of command.devices) {
            for (const exe of command.execution) {
              await this.executeCommandOnDevice(
                device,
                exe.command,
                exe.params,
                gglDevices
              )

              affectedDevices.push(device.id)
            }
          }
        }

        return {
          requestId: body.requestId,
          payload: {
            commands: [
              {
                ids: affectedDevices,
                status: "SUCCESS"
              }
            ]
          }
        }
      }

      case "action.devices.DISCONNECT": {
        // TODO
        return
      }

      default: {
        throw new Error("Bad intent")
      }
    }
  }

  async getDeviceState(device: FullGglDevice): Promise<Record<string, any>> {
    let state: Record<string, any> = {}

    for (const trait of device.traits) {
      const stateGetter = supportedTraits[trait.name].valueToGglState
      const partialState = await stateGetter(
        trait,
        async (deviceId, customId) => {
          return await this.valueService.getValue(deviceId, customId)
        }
      )
      state = { ...state, ...partialState }
    }

    return state
  }

  async executeCommandOnDevice(
    device: any,
    command: string,
    params: any,
    gglDevices: FullGglDevice[]
  ) {
    const commandName = command.split(".")[3]

    let targetTrait: string
    let commandToValue: CmdToVal

    for (const traitName in supportedTraits) {
      const trait = supportedTraits[traitName]

      for (const cmd in trait.commands) {
        if (cmd !== commandName) continue

        targetTrait = traitName
        commandToValue = trait.commands[cmd].commandToValue
      }
    }

    await commandToValue(
      params,
      gglDevices
        .find(gd => gd.id.toString() === device.id)
        .traits.find(t => t.name === targetTrait),
      async (deviceId, customId, val) => {
        await this.valueService.updateValue(
          "googlehome",
          customId,
          deviceId,
          val
        )
      }
    )
  }

  async reportStateToHomegraph(deviceId: number, customId: string) {
    const affectedUsers = await this.db.user.findMany({
      where: {
        gglSmarthomeIntegration: {
          devices: {
            some: {
              traits: { some: { targets: { some: { deviceId, customId } } } }
            }
          }
        }
      },
      select: {
        id: true,
        gglSmarthomeIntegration: {
          include: {
            devices: { include: { traits: { include: { targets: true } } } }
          }
        }
      }
    })

    const parsedUsers: Array<{ userId: string; devices: FullGglDevice[] }> =
      affectedUsers.map(u => ({
        userId: u.id,
        devices: u.gglSmarthomeIntegration.devices.filter(d =>
          d.traits.some(trait =>
            trait.targets.some(
              target =>
                target.customId === customId && target.deviceId === deviceId
            )
          )
        )
      }))

    for (const user of parsedUsers) {
      const states: Record<string, any> = {}

      for (const device of user.devices) {
        states[device.id.toString()] = await this.getDeviceState(device)
      }

      await homegraphClient.devices.reportStateAndNotification({
        requestBody: {
          agentUserId: user.userId,
          payload: { devices: { states } }
        }
      })
    }
  }
}
