import { forwardRef, Module } from "@nestjs/common"
import { DeviceModule } from "src/modules/device/device.module"
import { UserModule } from "src/modules/user/user.module"
import { GoogleSmarthomeModule } from "src/modules/gglsmarthome/gglsmarthome.module"

import { ValueController } from "./value.controller"
import { ValueGateway } from "./value.gateway"
import { ValueService } from "./value.service"

@Module({
  controllers: [ValueController],
  imports: [DeviceModule, forwardRef(() => UserModule), GoogleSmarthomeModule],
  providers: [ValueGateway, ValueService],
  exports: [ValueGateway, ValueService]
})
export class ValueModule {}
