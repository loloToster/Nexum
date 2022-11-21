import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ConflictException,
  NotFoundException
} from "@nestjs/common"
import { UserService } from "./user.service"

import { User as UserI } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { IsAdminGuard } from "src/guards/isadmin.guard"
import { LoggedInGuard } from "src/guards/loggedin.guard"
import { User } from "src/decorators/user.decorator"

import CreateUserDto from "src/dtos/createUser.dto"

@Controller("/users")
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

  @Delete("/:id")
  @UseGuards(IsAdminGuard)
  async removeUser(@Param("id") id: string) {
    try {
      return await this.userService.removeUser(id)
    } catch (err: unknown) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundException("No user with this id")
      } else {
        throw err
      }
    }
  }
}
