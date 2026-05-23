import { forwardRef, Module } from "@nestjs/common"

import { ValueModule } from "../value/value.module"
import { DeviceController } from "./device.controller"
import { DeviceGateway } from "./device.gateway"
import { DeviceService } from "./device.service"

@Module({
  imports: [forwardRef(() => ValueModule)],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceGateway],
  exports: [DeviceService]
})
export class DeviceModule {}
