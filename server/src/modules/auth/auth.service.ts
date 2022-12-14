import { Injectable } from "@nestjs/common"
import { DatabaseService } from "src/modules/database/database.service"

@Injectable()
export class AuthService {
  constructor(private db: DatabaseService) {}

  async getUser(id: string) {
    return await this.db.user.findUnique({ where: { id } })
  }
}
