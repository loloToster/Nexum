import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) { }

  async addUser(name: string, isAdmin: boolean) {
    const newUser = await this.db.user.create({
      data: { name, isAdmin }
    })

    return newUser
  }

  async getUsers() {
    const allUsers = await this.db.user.findMany()
    return allUsers
  }
}
