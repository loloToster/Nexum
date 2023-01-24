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

    this.connect()
  }

  async connect() {
    await this.r.connect()
    await this.r.configSet("appendonly", "yes")
    await this.r.configSet("save", "")
  }

  async set(key: string, value: string) {
    try {
      return this.r.set(key, value)
    } catch (err) {
      this.logger.error(err)
    }
  }

  async get(key: string): Promise<string | null>
  async get(keys: string[]): Promise<(string | null)[]>
  async get(keyOrKeys: string | string[]) {
    if (Array.isArray(keyOrKeys)) {
      if (!keyOrKeys.length) return []

      try {
        return await this.r.mGet(keyOrKeys)
      } catch (err) {
        this.logger.error(err)
        return keyOrKeys.map(() => null)
      }
    } else {
      try {
        return await this.r.get(keyOrKeys)
      } catch (err) {
        this.logger.error(err)
        return null
      }
    }
  }

  async keys(pattern: string) {
    try {
      return await this.r.keys(pattern)
    } catch (err) {
      this.logger.error(err)
      return []
    }
  }
}
