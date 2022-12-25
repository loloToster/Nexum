import { NestFactory } from "@nestjs/core"
import { Logger, ValidationPipe } from "@nestjs/common"
import axios from "axios"

import { AppModule } from "./app.module"

import { NotFoundInterceptor } from "./interceptors/notfound.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new NotFoundInterceptor())

  const port = process.env.PORT || 3000

  await app.listen(port, "0.0.0.0", () => {
    Logger.log("listening on port: " + port, "main")

    if (process.env.KEEP_ALIVE_URL) {
      Logger.log(`keeping ${process.env.KEEP_ALIVE_URL} alive`, "main")

      setInterval(() => {
        axios.get(process.env.KEEP_ALIVE_URL).catch(() => null)
      }, 10 * 60 * 1000)
    }
  })
}

bootstrap()
