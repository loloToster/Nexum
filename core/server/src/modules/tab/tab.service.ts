import { Injectable } from "@nestjs/common"

import { DatabaseService } from "src/modules/database/database.service"

@Injectable()
export class TabService {
  constructor(private db: DatabaseService) {}

  async getTabs() {
    return await this.db.tab.findMany()
  }

  async createTab(name: string, creatorId: string) {
    return await this.db.tab.create({
      data: {
        name,
        users: {
          connect: { id: creatorId }
        }
      }
    })
  }
}
