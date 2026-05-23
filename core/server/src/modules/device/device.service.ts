import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { Device } from "@prisma/client"

import { DatabaseService } from "src/modules/database/database.service"
import { DeviceGateway } from "./device.gateway"
import { ValueService } from "../value/value.service"
import { DeviceWithValues } from "src/types/types"

@Injectable()
export class DeviceService {
  constructor(
    private db: DatabaseService,
    private deviceGateway: DeviceGateway,
    @Inject(forwardRef(() => ValueService))
    private valueService: ValueService
  ) {}

  async createDevice({ token, name }: Partial<Device>) {
    if (!token) token = undefined

    const newDevice = await this.db.device.create({
      data: { token, name }
    })

    await this.syncDevicesInSlaves()

    return newDevice
  }

  async editDevice(id: number, key: string, value: Device[keyof Device]) {
    const r = await this.db.device.update({
      where: { id },
      data: { [key]: value }
    })
    await this.syncDevicesInSlaves()
    return r
  }

  async removeDevice(id: number) {
    const r = await this.db.device.delete({ where: { id } })
    await this.syncDevicesInSlaves()
    return r
  }

  async overrideDevices(devices: DeviceWithValues[]) {
    const incomingIds = devices.map(d => d.id)

    const existingDevices = await this.db.device.findMany({
      where: { id: { in: incomingIds } }
    })

    const existingIds = existingDevices.map(d => d.id)

    const devicesToCreate = devices.filter(d => !existingIds.includes(d.id))
    const devicesToUpdate = devices.filter(d => existingIds.includes(d.id))

    if (devicesToCreate.length > 0) {
      await this.db.device.createMany({
        data: devicesToCreate.map(d => ({
          id: d.id,
          token: d.token,
          name: d.name
        }))
      })
    }

    await Promise.all(
      devicesToUpdate.map(d =>
        this.db.device.update({
          where: { id: d.id },
          data: {
            token: d.token,
            name: d.name
          }
        })
      )
    )

    const dbDevices = await this.db.device.findMany({
      select: { id: true }
    })
    const idsToDelete = dbDevices
      .map(d => d.id)
      .filter(id => !incomingIds.includes(id))

    if (idsToDelete.length > 0) {
      await this.db.$transaction([
        this.db.widget.deleteMany({ where: { deviceId: { in: idsToDelete } } }),
        this.db.googlehomeTraitTarget.deleteMany({
          where: { deviceId: { in: idsToDelete } }
        }),
        this.db.device.deleteMany({ where: { id: { in: idsToDelete } } })
      ])
    }

    // sync values
    const localDevices = await this.db.device.findMany()

    for (const device of devices) {
      const localDevice = localDevices.find(d => device.id === d.id)

      const masterLastConnection = new Date(device.lastTimeConnected).getTime()
      const localLastConnection = new Date(
        localDevice.lastTimeConnected
      ).getTime()

      const masterValues = device.values
      const localValues = await this.valueService.getDeviceValues(
        localDevice.id
      )

      if (!masterValues || !localValues) {
        continue
      }

      // remove the same values
      const filteredMasterValues = masterValues.filter(
        e1 =>
          !localValues.some(
            e2 => e1.customId === e2.customId && e1.value === e2.value
          )
      )

      const filteredLocalValues = localValues.filter(
        e2 =>
          !masterValues.some(
            e1 => e1.customId === e2.customId && e1.value === e2.value
          )
      )

      if (localLastConnection <= masterLastConnection) {
        // master -> local
        for (const val of filteredMasterValues) {
          this.valueService.updateValue(
            "master",
            val.customId,
            device.id,
            val.value
          )
        }
      } else {
        // local -> master
        for (const val of filteredLocalValues) {
          this.valueService.slaveSocket?.emit("update-value", {
            target: this.valueService.createTarget(device.id, val.customId),
            value: val.value
          })
        }
      }
    }
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

    const mappedDevices: Array<Device & { active: number }> = []

    for (const device of devices) {
      mappedDevices.push({
        ...device,
        active: await this.getNumberOfDeviceConnections(device.id)
      })
    }

    return mappedDevices
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

  async getNumberOfDeviceConnections(deviceId: number) {
    const connectedDevices = await this.deviceGateway.server
      .in("devices")
      .fetchSockets()

    return connectedDevices.filter(
      connectedDevice => deviceId === connectedDevice.data.id
    ).length
  }

  async syncDevicesInSlaves(slaveId?: number) {
    const devices = await this.getDevices()
    const devicesWithVals: DeviceWithValues[] = []

    for (const device of devices) {
      devicesWithVals.push({
        ...device,
        lastTimeConnected: new Date(device.lastTimeConnected).getTime(),
        values: await this.valueService.getDeviceValues(device.id)
      })
    }

    this.deviceGateway.server
      .to(slaveId ? `slave-${slaveId}` : "slaves")
      .emit("devices", { devices })
  }
}
