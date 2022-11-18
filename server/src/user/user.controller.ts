import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Body,
  Query,
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
import RemoveByIdDto from "src/dtos/removeById.dto"

@Controller("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  getAllUsers(@Query("q") query?: string) {
    return this.userService.getUsers(query)
  }

  @Get("/me")
  @UseGuards(LoggedInGuard)
  getMe(@User() user: UserI) {
    return this.userService.getUserById(user.id)
  }

  @Post("/")
  @UseGuards(IsAdminGuard)
  async createUser(@Body() newUser: CreateUserDto) {
    try {
      return await this.userService.createUser(newUser)
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

  @Delete("/")
  @UseGuards(IsAdminGuard)
  async removeUser(@Body() { id }: RemoveByIdDto) {
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
