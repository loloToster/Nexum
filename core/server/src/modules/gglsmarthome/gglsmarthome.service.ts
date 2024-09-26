import { randomBytes } from "crypto"
import { BadRequestException, Injectable } from "@nestjs/common"

import { DatabaseService } from "src/modules/database/database.service"

import {
  EditGoogleSmarthomeDeviceDto,
  NewGoogleSmarthomeDeviceDto
} from "src/dtos/googleSmarthomeDevice.dto"

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
  constructor(private db: DatabaseService) {}

  async generateCodeForUser(id: string) {
    console.log("generating code for", id)

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
}
