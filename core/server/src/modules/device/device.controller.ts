import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ConflictException
} from "@nestjs/common"
import { DeviceService } from "./device.service"

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { IsAdminGuard } from "src/guards/isadmin.guard"

import CreateDeviceDto from "src/dtos/createDevice.dto"
import EditDto from "src/dtos/edit.dto"

@Controller("/api/devices")
@UseGuards(IsAdminGuard)
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Post("/")
  async createDevice(@Body() newDevice: CreateDeviceDto) {
    try {
      return await this.deviceService.createDevice(newDevice)
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
  getAllDevices(@Query("q") query?: string) {
    return this.deviceService.getDevices(query)
  }

  @Get("/:id")
  getDevice(@Param("id") id: number) {
    return this.deviceService.getDeviceById(id)
  }

  @Patch("/:id")
  async editDevice(@Param("id") id: number, @Body() { key, value }: EditDto) {
    return this.deviceService.editDevice(id, key, value)
  }

  @Delete("/:id")
  async removeDevice(@Param("id") id: number) {
    return this.deviceService.removeDevice(id)
  }
}
