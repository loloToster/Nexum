import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"

import { AppModule } from "./app.module"

import { NotFoundInterceptor } from "./interceptors/notfound.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new NotFoundInterceptor())

  const port = process.env.PORT || 3000
  await app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log("listening on port:", port)
  })
}

bootstrap()
