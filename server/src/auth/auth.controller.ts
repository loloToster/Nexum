import { Controller, Post, Body, NotFoundException } from "@nestjs/common"
import { AuthService } from "./auth.service"

import LoginDto from "src/dtos/login.dto"

@Controller("/auth")
export class AuthController {
  constructor(private userService: AuthService) {}

  @Post("/login")
  async login(@Body() body: LoginDto) {
    const user = await this.userService.getUser(body.token)

    if (!user) throw new NotFoundException("No user with this code")

    return user
  }
}
