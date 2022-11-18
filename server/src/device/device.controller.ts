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
import { DeviceService } from "./device.service"

import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { IsAdminGuard } from "src/guards/isadmin.guard"

import CreateDeviceDto from "src/dtos/createDevice.dto"
import RemoveByIdDto from "src/dtos/removeById.dto"

@Controller("/devices")
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  getAllDevices(@Query("q") query?: string) {
    return this.deviceService.getDevices(query)
  }

  @Post("/")
  @UseGuards(IsAdminGuard)
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

  @Delete("/")
  @UseGuards(IsAdminGuard)
  async removeDevice(@Body() { id }: RemoveByIdDto) {
    try {
      return await this.deviceService.removeDevice(id)
    } catch (err: unknown) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundException("No device with this id")
      } else {
        throw err
      }
    }
  }
}
