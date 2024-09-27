import { Module } from "@nestjs/common"

import { UserModule } from "../user/user.module"
import { DeviceModule } from "../device/device.module"
import { ValueModule } from "../value/value.module"

import { GoogleSmarthomeController } from "./gglsmarthome.controller"
import { GoogleSmarthomeService } from "./gglsmarthome.service"

@Module({
  imports: [UserModule, DeviceModule, ValueModule],
  controllers: [GoogleSmarthomeController],
  providers: [GoogleSmarthomeService]
})
export class GoogleSmarthomeModule {}
