import { Module } from "@nestjs/common"

import { UserModule } from "../user/user.module"
import { GoogleSmarthomeController } from "./gglsmarthome.controller"
import { GoogleSmarthomeService } from "./gglsmarthome.service"

@Module({
  imports: [UserModule],
  controllers: [GoogleSmarthomeController],
  providers: [GoogleSmarthomeService]
})
export class GoogleSmarthomeModule {}
