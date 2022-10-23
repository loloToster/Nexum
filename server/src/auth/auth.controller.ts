import { Controller, Post, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"

@Controller("/auth")
export class AuthController {
  constructor(private userService: AuthService) {}

  @Post("/login")
  async login(@Body("token") token: string) {
    return this.userService.getUser(token)
  }
}
