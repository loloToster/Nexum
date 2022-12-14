import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException
} from "@nestjs/common"

import { ValueService } from "./value.service"
import { DeviceService } from "../device/device.service"
import { ValueGateway } from "./value.gateway"

// todo: cleanup & and dry
@Controller("/api")
export class ValueController {
  constructor(
    private valueService: ValueService,
    private valueGateway: ValueGateway,
    private deviceService: DeviceService
  ) {}

  @Get("/:token/get/:customId")
  async getValue(
    @Param("token") token: string,
    @Param("customId") customId: string
  ) {
    const device = await this.deviceService.getDeviceByToken(token)
    const { value } = await this.valueService.getValue(device.id, customId)
    return value
  }

  @Get("/:token/update/:customId")
  async updateValue(
    @Param("token") token: string,
    @Param("customId") customId: string,
    @Query("value") value: string
  ) {
    if (!value) throw new BadRequestException()

    const parsedValue = JSON.parse(value)
    const device = await this.deviceService.getDeviceByToken(token)

    await this.valueService.updateValue(
      this.valueGateway.server,
      `${device.id}-${customId}`,
      customId,
      device.id,
      parsedValue
    )
  }
}
