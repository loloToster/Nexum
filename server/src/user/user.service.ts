import { Injectable } from "@nestjs/common"
import { User, Value } from "@prisma/client"
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

    // get values for all widgets
    const targetsQuery = user.tabs
      .map(t => t.widgets)
      .flat()
      .map(w => ({ AND: { customId: w.customId, deviceId: w.deviceId } }))

    const values = await this.db.value.findMany({
      where: {
        OR: targetsQuery
      }
    })

    // this entire logic just adds target and value properties to every widget
    return {
      ...user,
      tabs: user.tabs.map(tab => ({
        ...tab,
        widgets: tab.widgets.map(widget => {
          const value: Value | undefined = values.find(
            val =>
              widget.deviceId === val.deviceId &&
              widget.customId === val.customId
          )

          const parsedValue = value ? JSON.parse(value.value) : null

          return {
            ...widget,
            value: parsedValue,
            target: `${widget.deviceId}-${widget.customId}`
          }
        })
      }))
    }
  }
}
