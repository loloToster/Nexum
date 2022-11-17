import { Injectable } from "@nestjs/common"
import { DatabaseService } from "src/database/database.service"

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async addUser(name: string, isAdmin: boolean) {
    const newUser = await this.db.user.create({
      data: { name, isAdmin }
    })

    return newUser
  }

  async getUsers(searchQuery?: string) {
    if (searchQuery) searchQuery = decodeURIComponent(searchQuery)

    const where = {
      OR: [
        { name: { contains: searchQuery } },
        { id: { contains: searchQuery } }
      ]
    }

    const users = await this.db.user.findMany({
      include: { tabs: true },
      where: searchQuery ? where : undefined
    })

    return users
  }

  async getUserById(id: string) {
    const allUsers = await this.db.user.findUnique({
      where: { id },
      include: {
        tabs: { include: { widgets: { include: { properties: true } } } }
      }
    })
    return allUsers
  }
}
