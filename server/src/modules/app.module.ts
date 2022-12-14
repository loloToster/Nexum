import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common"
import { ServeStaticModule } from "@nestjs/serve-static"

import { AuthMiddleware } from "src/middleware/auth.middleware"

import { DatabaseModule } from "./database/database.module"
import { ValueModule } from "./value/value.module"
import { AuthModule } from "./auth/auth.module"
import { DeviceModule } from "./device/device.module"
import { UserModule } from "./user/user.module"
import { TabModule } from "./tab/tab.module"

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/../../../../client/web-build`
    }),
    AuthModule,
    DeviceModule,
    UserModule,
    DatabaseModule,
    ValueModule,
    TabModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("*")
  }
}
