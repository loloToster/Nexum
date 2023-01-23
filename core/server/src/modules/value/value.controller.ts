import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  NotFoundException
} from "@nestjs/common"

import { ValueService } from "./value.service"
import { ValueGateway } from "./value.gateway"
import { DeviceService } from "../device/device.service"

@Controller("/api/value")
export class ValueController {
  constructor(
    private valueService: ValueService,
    private valueGateway: ValueGateway,
    private deviceService: DeviceService
  ) {}

  @Get("/:token/:action/:customId")
  async valueAction(
    @Param("token") token: string,
    @Param("action") action: string,
    @Param("customId") customId: string,
    @Query("value") value: string
  ) {
    // only 2 actions are allowed
    if (!["get", "update"].includes(action)) throw new NotFoundException()
    // there needs to be a value when updating
    if (action === "update" && !value)
      throw new BadRequestException("include value in request")

    const device = await this.deviceService.getDeviceByToken(token)

    if (action === "get") {
      return await this.valueService.getValue(device.id, customId)
    } else {
      const parsedValue = JSON.parse(value)

      await this.valueService.updateValue(
        this.valueGateway.server,
        customId,
        device.id,
        parsedValue
      )
    }
  }
}
