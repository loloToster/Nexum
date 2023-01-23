import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { Tab, User } from "@prisma/client"

import { DatabaseService } from "src/modules/database/database.service"
import { ValueService } from "src/modules/value/value.service"

import { UserWithTabs, UserWithTabsAndWidgets } from "src/types/types"

@Injectable()
export class UserService {
  constructor(
    private db: DatabaseService,
    @Inject(forwardRef(() => ValueService))
    private valueService: ValueService
  ) {}

  async createUser({ id, name, isAdmin = false }: Partial<User>) {
    if (!id) id = undefined

    const newUser = await this.db.user.create({
      data: { id, name, isAdmin }
    })

    return newUser
  }

  async editUser<K extends keyof UserWithTabs>(
    id: string,
    key: K,
    value: UserWithTabs[K]
  ) {
    if (key === "tabs") {
      return await this.db.user.update({
        where: { id },
        data: { tabs: { set: (value as Tab[]).map(t => ({ id: t.id })) } }
      })
    } else {
      return await this.db.user.update({
        where: { id },
        data: { [key]: value }
      })
    }
  }

  async removeUser(id: string) {
    return await this.db.user.delete({ where: { id } })
  }

  async getUsers(searchQuery?: string) {
    if (searchQuery) searchQuery = decodeURIComponent(searchQuery)

    const users = await this.db.user.findMany({
      include: { tabs: true },
      where: searchQuery
        ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { id: { contains: searchQuery, mode: "insensitive" } }
          ]
        }
        : undefined
    })

    return users
  }

  async getUserById(id: string): Promise<UserWithTabsAndWidgets | null> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        tabs: { include: { widgets: { include: { properties: true } } } }
      }
    })

    if (!user) return null

    // this entire logic just adds target property to every widget
    return {
      ...user,
      tabs: user.tabs.map(tab => ({
        ...tab,
        widgets: tab.widgets.map(widget => {
          return {
            ...widget,
            target: this.valueService.createTarget(
              widget.deviceId,
              widget.customId
            )
          }
        })
      }))
    }
  }
}
