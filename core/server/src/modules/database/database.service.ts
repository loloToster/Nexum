import { Injectable, Logger } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class DatabaseService extends PrismaClient {
  private readonly logger = new Logger(DatabaseService.name)

  constructor() {
    super()

    this.user
      .findFirst({ where: { isAdmin: true } })
      .then(async user => {
        if (user) return

        const initAdmin = await this.user.create({
          data: { isAdmin: true, name: "admin", id: "admin" }
        })

        this.logger.log(`Created initial admin with id: '${initAdmin.id}'`)
      })
      .catch(err => {
        this.logger.warn("Error while creating initial admin: " + err)
      })
  }
}
