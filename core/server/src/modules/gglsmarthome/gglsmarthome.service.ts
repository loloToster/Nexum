import { randomBytes } from "crypto"
import { BadRequestException, Injectable } from "@nestjs/common"
import { DatabaseService } from "src/modules/database/database.service"

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
}
