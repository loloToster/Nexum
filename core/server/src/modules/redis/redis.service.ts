import { Injectable, Logger } from "@nestjs/common"
import { createClient } from "redis"

@Injectable()
export class RedisService {
  r: ReturnType<typeof createClient>

  private readonly logger = new Logger(RedisService.name)

  constructor() {
    this.r = createClient({
      url: process.env.REDIS_URL
    })

    this.r.on("error", this.logger.error)

    this.r.connect()
  }

  set(key: string, value: string) {
    return this.r.set(key, value)
  }

  get(key: string): Promise<string>
  get(keys: string[]): Promise<string[]>
  get(keyOrKeys: string | string[]) {
    if (Array.isArray(keyOrKeys)) {
      return this.r.mGet(keyOrKeys)
    } else {
      return this.r.get(keyOrKeys)
    }
  }

  keys(pattern: string) {
    return this.r.keys(pattern)
  }
}
