import { Controller, Post, Body, NotFoundException } from "@nestjs/common"
import { AuthService } from "./auth.service"

@Controller("/auth")
export class AuthController {
  constructor(private userService: AuthService) {}

  @Post("/login")
  async login(@Body("token") token: string) {
    const user = await this.userService.getUser(token)

    if (!user) throw new NotFoundException("No user with this code")

    return user
  }
}
