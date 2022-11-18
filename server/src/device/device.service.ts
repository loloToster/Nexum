import { Injectable } from "@nestjs/common"
import { Device } from "@prisma/client"
import { DatabaseService } from "src/database/database.service"

@Injectable()
export class DeviceService {
  constructor(private db: DatabaseService) {}

  async createDevice({ id, name }: Partial<Device>) {
    if (!id) id = undefined

    const newDevice = await this.db.device.create({
      data: { id, name }
    })

    return newDevice
  }

  async removeDevice(id: string) {
    return await this.db.device.delete({ where: { id } })
  }

  async getDevices(searchQuery?: string) {
    if (searchQuery) searchQuery = decodeURIComponent(searchQuery)

    const where = {
      OR: [
        { name: { contains: searchQuery } },
        { id: { contains: searchQuery } }
      ]
    }

    const devices = await this.db.device.findMany({
      where: searchQuery ? where : undefined
    })

    return devices
  }
}
