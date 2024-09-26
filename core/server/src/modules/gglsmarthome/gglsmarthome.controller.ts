import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Res,
  Headers,
  Logger,
  UseGuards,
  Delete,
  Patch
} from "@nestjs/common"
import { Response } from "express"
import { readFileSync } from "fs"
import { join as pathJoin } from "path"

import { User as UserI } from "@prisma/client"

import { UserService } from "../user/user.service"
import { GoogleSmarthomeService } from "./gglsmarthome.service"

import { LoggedInGuard } from "src/guards/loggedin.guard"
import { User } from "src/decorators/user.decorator"

import {
  GoogleSmarthomeConnectQueryDto,
  GoogleSmarthomeConnectBodyDto
} from "src/dtos/googleSmarthomeConnect.dto"
import GoogleSmarthomeTokenReqDto from "src/dtos/googleSmarthomeTokenReq.dto"
import {
  EditGoogleSmarthomeDeviceDto,
  NewGoogleSmarthomeDeviceDto
} from "src/dtos/googleSmarthomeDevice.dto"

const {
  GOOGLE_SMARTHOME_CLIENT_ID,
  GOOGLE_SMARTHOME_CLIENT_SECRET,
  GOOGLE_SMARTHOME_PROJECT_ID
} = process.env

const AUTH_PAGE_FILE_NAME = "gglsmarthome-connect.html"

@Controller("/api/gglsmarthome")
export class GoogleSmarthomeController {
  private readonly logger = new Logger(GoogleSmarthomeController.name)

  authPage: string

  constructor(
    private gglSmarthomeService: GoogleSmarthomeService,
    private userService: UserService
  ) {
    this.authPage = readFileSync(
      pathJoin(__dirname, AUTH_PAGE_FILE_NAME)
    ).toString()
  }

  @Get("/auth")
  @Header("Content-type", "text/html")
  authorize(@Query() query: Record<string, string>) {
    const querystring = new URLSearchParams(query).toString()

    return this.authPage.replace("${querystring}", querystring)
  }

  @Post("/connect")
  async connectAccountToGoogle(
    @Res() res: Response,
    @Query() query: GoogleSmarthomeConnectQueryDto,
    @Body() body: GoogleSmarthomeConnectBodyDto
  ) {
    if (
      query.client_id !== GOOGLE_SMARTHOME_CLIENT_ID ||
      ![
        `https://oauth-redirect.googleusercontent.com/r/${GOOGLE_SMARTHOME_PROJECT_ID}`,
        `https://oauth-redirect-sandbox.googleusercontent.com/r/${GOOGLE_SMARTHOME_PROJECT_ID}`
      ].includes(query.redirect_uri)
    )
      throw new BadRequestException()

    const user = await this.userService.getUserById(body.token)

    if (!user) throw new BadRequestException()

    const code = await this.gglSmarthomeService.generateCodeForUser(user.id)

    console.log("redirecting")
    res.redirect(
      `${query.redirect_uri}?state=${encodeURIComponent(
        query.state
      )}&code=${encodeURIComponent(code)}`
    )
  }

  @Post("/token")
  async getToken(@Body() body: GoogleSmarthomeTokenReqDto) {
    if (
      body.client_id !== GOOGLE_SMARTHOME_CLIENT_ID ||
      body.client_secret !== GOOGLE_SMARTHOME_CLIENT_SECRET
    )
      throw new BadRequestException()

    if (body.grant_type === "authorization_code") {
      if (!body.code) throw new BadRequestException()

      const data = await this.gglSmarthomeService.generateTokensFromCode(
        body.code
      )

      return {
        token_type: "Bearer",
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        expires_in: data.expiresIn
      }
    } else {
      if (!body.refresh_token) throw new BadRequestException()

      const data = await this.gglSmarthomeService.refreshAccessToken(
        body.refresh_token
      )

      return {
        token_type: "Bearer",
        access_token: data.accessToken,
        expires_in: data.expiresIn
      }
    }
  }

  @Post("/data")
  async handleData(
    @Body() body: any,
    @Headers("authorization") authHeader: string
  ) {
    const [tokenType, token] = authHeader?.split(" ") ?? []

    if (tokenType !== "Bearer" || !token) {
      this.logger.warn("Bad auth in google integration")
      return
    }

    const user = await this.userService.getUserByGoogleToken(token)

    if (!user) {
      this.logger.warn("No user found in google integration")
      return
    }

    return {
      requestId: body.requestId,
      payload: {
        agentUserId: user.id,
        devices: [
          {
            id: "1",
            type: "action.devices.types.LIGHT",
            traits: ["action.devices.traits.OnOff"],
            name: { name: "Test" },
            willReportState: true
          }
        ]
      }
    }
  }

  // FOR USER:

  @Get("/devices")
  @UseGuards(LoggedInGuard)
  async getDevices(@User() user: UserI) {
    return await this.gglSmarthomeService.getUserGoogleDevices(user.id)
  }

  @Post("/devices")
  @UseGuards(LoggedInGuard)
  async newDevice(
    @User() user: UserI,
    @Body() body: NewGoogleSmarthomeDeviceDto
  ) {
    return await this.gglSmarthomeService.createNewDevice(user.id, body)
  }

  @Delete("/devices")
  @UseGuards(LoggedInGuard)
  async deleteDevice(@User() user: UserI, @Query("id") deviceId: string) {
    return this.gglSmarthomeService.removeDevice(user.id, parseInt(deviceId))
  }

  @Patch("/devices")
  @UseGuards(LoggedInGuard)
  async editDevice(
    @User() user: UserI,
    @Body() body: EditGoogleSmarthomeDeviceDto
  ) {
    return await this.gglSmarthomeService.editDevice(user.id, body)
  }
}
