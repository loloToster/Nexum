import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Logger
} from "@nestjs/common"

import { AuthService } from "./auth.service"

import LoginDto from "src/dtos/login.dto"

@Controller("/auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private userService: AuthService) {}

  @Post("/login")
  async login(@Body() body: LoginDto) {
    const user = await this.userService.getUser(body.token)

    if (!user) throw new NotFoundException("No user with this code")

    this.logger.log(`${user.name} logged in`)

    return user
  }
}
