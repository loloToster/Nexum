import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common"

import { AuthMiddleware } from "./middleware/auth.middleware"

import { DatabaseModule } from "./database/database.module"

import { EventsGateway } from "./gateways/events.gateway"

import { UserModule } from "./user/user.module"
import { AuthModule } from "./auth/auth.module"

@Module({
  imports: [AuthModule, UserModule, DatabaseModule, EventsGateway]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("*")
  }
}
