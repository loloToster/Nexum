import { Injectable } from "@nestjs/common"
import { Device } from "@prisma/client"
import { DatabaseService } from "src/database/database.service"

@Injectable()
export class DeviceService {
  constructor(private db: DatabaseService) {}

  async createDevice({ token, name }: Partial<Device>) {
    if (!token) token = undefined

    const newDevice = await this.db.device.create({
      data: { token, name }
    })

    return newDevice
  }

  async editDevice(id: number, key: string, value: Device[keyof Device]) {
    return await this.db.device.update({
      where: { id },
      data: { [key]: value }
    })
  }

  async removeDevice(id: number) {
    return await this.db.device.delete({ where: { id } })
  }

  async getDevices(searchQuery?: string) {
    if (searchQuery) searchQuery = decodeURIComponent(searchQuery)

    const where = {
      OR: [
        { name: { contains: searchQuery } },
        { token: { contains: searchQuery } }
      ]
    }

    const devices = await this.db.device.findMany({
      where: searchQuery ? where : undefined
    })

    return devices
  }

  async getDeviceById(id: number) {
    const device = await this.db.device.findUnique({
      where: { id }
    })

    return device
  }

  async getDeviceByToken(token: string) {
    const device = await this.db.device.findUnique({
      where: { token }
    })

    return device
  }
}
