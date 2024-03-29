import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common"
import { ServeStaticModule } from "@nestjs/serve-static"

import { AuthMiddleware } from "src/middleware/auth.middleware"

import { DatabaseModule } from "./database/database.module"
import { RedisModule } from "./redis/redis.module"
import { MqttModule } from "./mqtt/mqtt.module"
import { AuthModule } from "./auth/auth.module"
import { UserModule } from "./user/user.module"
import { TabModule } from "./tab/tab.module"
import { WidgetModule } from "./widget/widget.module"
import { DeviceModule } from "./device/device.module"
import { ValueModule } from "./value/value.module"
import { GoogleSmarthomeModule } from "./gglsmarthome/gglsmarthome.module"

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/../../../client/web-build`
    }),
    DatabaseModule,
    RedisModule,
    MqttModule,
    AuthModule,
    UserModule,
    TabModule,
    WidgetModule,
    DeviceModule,
    ValueModule,
    GoogleSmarthomeModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("*")
  }
}
