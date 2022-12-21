import { Module } from "@nestjs/common"

import { DeviceController } from "./device.controller"
import { DeviceGateway } from "./device.gateway"
import { DeviceService } from "./device.service"

@Module({
  controllers: [DeviceController],
  providers: [DeviceService, DeviceGateway],
  exports: [DeviceService]
})
export class DeviceModule {}
