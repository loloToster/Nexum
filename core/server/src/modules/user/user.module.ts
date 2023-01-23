import { forwardRef, Module } from "@nestjs/common"

import { ValueModule } from "src/modules/value/value.module"

import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
  controllers: [UserController],
  imports: [forwardRef(() => ValueModule)],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
