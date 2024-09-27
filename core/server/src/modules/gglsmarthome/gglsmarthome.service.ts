import { randomBytes } from "crypto"
import { BadRequestException, Injectable } from "@nestjs/common"
import { User } from "@prisma/client"

import { FullGglDevice } from "src/types/types"

import { DatabaseService } from "src/modules/database/database.service"
import { DeviceService } from "../device/device.service"

import {
  EditGoogleSmarthomeDeviceDto,
  NewGoogleSmarthomeDeviceDto
} from "src/dtos/googleSmarthomeDevice.dto"
import { ValueService } from "../value/value.service"

import { CmdToVal, supportedTraits } from "./ggl-value-maps"

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
  constructor(
    private db: DatabaseService,
    private deviceService: DeviceService,
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

  async createNewDevice(userId: string, device: NewGoogleSmarthomeDeviceDto) {
    return await this.db.googlehomeDevice.create({
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
  }

  async removeDevice(userId: string, deviceId: number) {
    await this.db.googlehomeDevice.deleteMany({
      where: { AND: [{ id: deviceId }, { integration: { userId } }] }
    })
  }

  async editDevice(userId: string, device: EditGoogleSmarthomeDeviceDto) {
    // todo: add edit support
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
            devices: devices.map(device => ({
              id: device.id.toString(),
              type: `action.devices.types.${device.type}`,
              traits: device.traits.map(
                trait => `action.devices.traits.${trait.name}`
              ),
              name: { name: device.name },
              willReportState: true
            }))
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
        await this.valueService.updateValue(null, customId, deviceId, val)
      }
    )
  }
}
