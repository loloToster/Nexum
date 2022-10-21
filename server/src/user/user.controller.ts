import { Controller, Get, Post, Body } from "@nestjs/common"
import { UserService } from "./user.service"

@Controller("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  getMe() {
    return this.userService.getUsers()
  }

  @Post("/")
  createUser(@Body("name") name: string) {
    return this.userService.addUser(name, false)
  }
}
