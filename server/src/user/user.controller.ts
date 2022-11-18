import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  ConflictException,
  BadRequestException,
  Delete
} from "@nestjs/common"
import { UserService } from "./user.service"

import { User as UserI } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { IsAdminGuard } from "src/guards/isadmin.guard"
import { LoggedInGuard } from "src/guards/loggedin.guard"
import { User } from "src/decorators/user.decorator"

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
  async createUser(
    @Body("name") name: string,
    @Body("isAdmin") isAdmin: boolean | undefined,
    @Body("id") id: string | undefined
  ) {
    if (!name) throw new BadRequestException("Name cannot be empty")

    try {
      return await this.userService.createUser({ name, isAdmin, id })
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
  async removeUser(@Body("id") id: string) {
    return this.userService.removeUser(id)
  }
}
