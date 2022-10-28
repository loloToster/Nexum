import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"

import { IsAdminGuard } from "src/guards/isadmin.guard"

@Controller("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  getAllUsers() {
    return this.userService.getUsers()
  }

  @Post("/")
  createUser(@Body("name") name: string) {
    return this.userService.addUser(name, false)
  }
}
