import { Injectable, Logger } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"
import { PrismaClientOptions } from "@prisma/client/runtime"

@Injectable()
export class DatabaseService extends PrismaClient<
  PrismaClientOptions,
  "info" | "warn" | "error"
> {
  private readonly logger = new Logger(DatabaseService.name)

  constructor() {
    super({
      log: [
        {
          emit: "event",
          level: "info"
        },
        {
          emit: "event",
          level: "warn"
        },
        {
          emit: "event",
          level: "error"
        }
      ]
    })

    this.$on("info", e => this.logger.log(e.message))
    this.$on("warn", e => this.logger.warn(e.message))
    this.$on("error", e => this.logger.error(e.message))

    this.createInitialAdmin("admin", "admin")
  }

  async createInitialAdmin(id: string, name: string) {
    try {
      const user = await this.user.findFirst({ where: { isAdmin: true } })
      if (user) return

      const initAdmin = await this.user.create({
        data: { isAdmin: true, id, name }
      })

      this.logger.log(`Created initial admin with id: '${initAdmin.id}'`)
    } catch (err) {
      this.logger.warn("Error while creating initial admin: " + err)
    }
  }
}
