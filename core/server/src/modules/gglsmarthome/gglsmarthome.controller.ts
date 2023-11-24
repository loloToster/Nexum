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
