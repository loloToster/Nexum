import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"

import { AppModule } from "./app.module"

import { NotFoundInterceptor } from "./interceptors/notfound.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new NotFoundInterceptor())

  await app.listen(3000)
}

bootstrap()
