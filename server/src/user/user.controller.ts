import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common"
import { UserService } from "./user.service"

import { User as UserI } from "@prisma/client"

import { IsAdminGuard } from "src/guards/isadmin.guard"
import { LoggedInGuard } from "src/guards/loggedin.guard"
import { User } from "src/decorators/user.decorator"

@Controller("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  getAllUsers() {
    return this.userService.getUsers()
  }

  @Get("/me")
  @UseGuards(LoggedInGuard)
  getMe(@User() user: UserI) {
    return this.userService.getUserById(user.id)
  }

  @Post("/")
  @UseGuards(IsAdminGuard)
  createUser(@Body("name") name: string) {
    return this.userService.addUser(name, false)
  }
}
