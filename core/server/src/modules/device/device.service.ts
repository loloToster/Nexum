import { Injectable } from "@nestjs/common"
import { Device } from "@prisma/client"

import { DatabaseService } from "src/modules/database/database.service"
import { DeviceGateway } from "./device.gateway"

@Injectable()
export class DeviceService {
  constructor(
    private db: DatabaseService,
    private deviceGateway: DeviceGateway
  ) {}

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

    const devices = await this.db.device.findMany({
      where: searchQuery
        ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { token: { contains: searchQuery, mode: "insensitive" } }
          ]
        }
        : undefined
    })

    const connectedDevices = await this.deviceGateway.server
      .in("devices")
      .fetchSockets()

    return devices.map(device => ({
      ...device,
      active: connectedDevices.filter(
        connectedDevice => device.id === connectedDevice.data.id
      ).length
    }))
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
