import { Module } from "@nestjs/common"
import { UserModule } from "src/user/user.module"
import { EventsGateway } from "./events.gateway"

@Module({
  imports: [UserModule],
  providers: [EventsGateway],
  exports: [EventsGateway]
})
export class EventsModule {}
