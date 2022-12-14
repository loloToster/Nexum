import { Module } from "@nestjs/common"
import { DeviceModule } from "src/device/device.module"
import { UserModule } from "src/user/user.module"

import { ValueController } from "./value.controller"
import { ValueGateway } from "./value.gateway"
import { ValueService } from "./value.service"

@Module({
  controllers: [ValueController],
  imports: [DeviceModule, UserModule],
  providers: [ValueGateway, ValueService],
  exports: [ValueGateway, ValueService]
})
export class ValueModule {}
