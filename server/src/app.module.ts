import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common"

import { AuthMiddleware } from "./middleware/auth.middleware"

import { DatabaseModule } from "./database/database.module"

import { EventsGateway } from "./gateways/events.gateway"

import { AuthModule } from "./auth/auth.module"
import { DeviceModule } from "./device/device.module"
import { UserModule } from "./user/user.module"

@Module({
  imports: [AuthModule, DeviceModule, UserModule, DatabaseModule, EventsGateway]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("*")
  }
}
