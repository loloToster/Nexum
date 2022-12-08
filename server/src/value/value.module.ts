import { Module } from "@nestjs/common"
import { DeviceModule } from "src/device/device.module"
import { UserModule } from "src/user/user.module"

import { ValueGateway } from "./value.gateway"
import { ValueService } from "./value.service"

@Module({
  imports: [DeviceModule, UserModule],
  providers: [ValueGateway, ValueService],
  exports: [ValueGateway, ValueService]
})
export class ValueModule {}
