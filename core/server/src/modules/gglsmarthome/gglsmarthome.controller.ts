import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res
} from "@nestjs/common"
import { Response } from "express"

import { UserService } from "../user/user.service"
import { GoogleSmarthomeService } from "./gglsmarthome.service"

import {
  GoogleSmarthomeConnectQueryDto,
  GoogleSmarthomeConnectBodyDto
} from "src/dtos/googleSmarthomeConnect.dto"
import GoogleSmarthomeTokenReqDto from "src/dtos/googleSmarthomeTokenReq.dto"

const {
  GOOGLE_SMARTHOME_CLIENT_ID,
  GOOGLE_SMARTHOME_CLIENT_SECRET,
  GOOGLE_SMARTHOME_PROJECT_ID
} = process.env

@Controller("/api/gglsmarthome")
export class GoogleSmarthomeController {
  constructor(
    private gglSmarthomeService: GoogleSmarthomeService,
    private userService: UserService
  ) {}

  @Get("/auth")
  authorize(@Query() query: Record<string, string>) {
    const querystring = new URLSearchParams(query).toString()

    // TODO: make prettier
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <form action="connect?${querystring}" method="post">
          <h1>Connect Google</h1>
          <input type="text" name="token">
          <button type="submit">OK</button>
        </form>
      </body>
      </html>
    `
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
  async handleData() {
    console.log("data")
  }
}
