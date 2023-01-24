import { Injectable, Logger } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class DatabaseService extends PrismaClient {
  private readonly logger = new Logger(DatabaseService.name)

  constructor() {
    super()

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
