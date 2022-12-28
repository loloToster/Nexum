import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  ConflictException
} from "@nestjs/common"

import { UserService } from "./user.service"

import { User as UserI } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { IsAdminGuard } from "src/guards/isadmin.guard"
import { LoggedInGuard } from "src/guards/loggedin.guard"
import { User } from "src/decorators/user.decorator"

import CreateUserDto from "src/dtos/createUser.dto"
import EditDto from "src/dtos/edit.dto"

import { UserWithTabs } from "src/types/types"

@Controller("/api/users")
@UseGuards(LoggedInGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post("/")
  @UseGuards(IsAdminGuard)
  async createUser(@Body() newUser: CreateUserDto) {
    try {
      return this.userService.createUser(newUser)
    } catch (err: unknown) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        err.meta?.target[0] === "id"
      ) {
        throw new ConflictException({ conflictOn: "id" })
      } else {
        throw err
      }
    }
  }

  @Get("/")
  @UseGuards(IsAdminGuard)
  getAllUsers(@Query("q") query?: string) {
    return this.userService.getUsers(query)
  }

  @Get("/me")
  getMe(@User() user: UserI) {
    return this.userService.getUserById(user.id)
  }

  @Get("/:id")
  @UseGuards(IsAdminGuard)
  getUser(@Param("id") id: string) {
    return this.userService.getUserById(id)
  }

  @Patch("/:id")
  async editDevice(@Param("id") id: string, @Body() { key, value }: EditDto) {
    return this.userService.editUser(id, key as keyof UserWithTabs, value)
  }

  @Delete("/:id")
  @UseGuards(IsAdminGuard)
  async removeUser(@Param("id") id: string) {
    return this.userService.removeUser(id)
  }
}
