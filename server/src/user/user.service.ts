import { Injectable } from "@nestjs/common"
import { User } from "@prisma/client"
import { DatabaseService } from "src/database/database.service"

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async createUser({ id, name, isAdmin = false }: Partial<User>) {
    if (!id) id = undefined

    const newUser = await this.db.user.create({
      data: { id, name, isAdmin }
    })

    return newUser
  }

  async editUser(id: string, key: string, value: User[keyof User]) {
    return await this.db.user.update({
      where: { id },
      data: { [key]: value }
    })
  }

  async removeUser(id: string) {
    return await this.db.user.delete({ where: { id } })
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
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        tabs: { include: { widgets: { include: { properties: true } } } }
      }
    })

    return user
  }
}
