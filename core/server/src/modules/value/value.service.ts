import { Injectable } from "@nestjs/common"
import { Socket, Server } from "socket.io"

import { DatabaseService } from "src/modules/database/database.service"
import { UserWithTabsAndWidgets } from "src/types/types"

type Value = string | boolean | number

@Injectable()
export class ValueService {
  constructor(private db: DatabaseService) {}

  createTarget(deviceId: number | string, customId: string) {
    return `${deviceId}-${customId}`
  }

  parseTarget(target: string) {
    const [deviceId, customId] = target.split(/-(.*)/s)

    return {
      deviceId: parseInt(deviceId),
      customId
    }
  }

  async updateValue(origin: Socket | Server, target: string, value: Value)
  async updateValue(
    origin: Socket | Server,
    customId: string,
    deviceId: number,
    value: Value
  )
  async updateValue(
    origin: Socket | Server,
    targetOrCustomId: string,
    deviceIdOrValue: Value | number,
    valueOrUndefined?: Value
  ) {
    const updater = origin instanceof Server ? origin : origin.broadcast

    let value: Value, target: string, deviceId: number, customId: string

    if (valueOrUndefined === undefined) {
      // 1st overload
      value = deviceIdOrValue
      target = targetOrCustomId
      const parsedTarget = this.parseTarget(target) // target.split(/-(.*)/s)
      deviceId = parsedTarget.deviceId
      customId = parsedTarget.customId
    } else {
      // 2nd overload
      value = valueOrUndefined
      deviceId = deviceIdOrValue as number
      customId = targetOrCustomId
      target = this.createTarget(deviceId, customId)
    }

    // send update to every user that can read current target
    updater.to(target).emit("update-value", { target, value })

    // send update to devices with id from target
    updater.to(`device-${deviceId}`).emit("update-value", { customId, value })

    // save value in db
    const parsedValue = JSON.stringify(value)

    try {
      await this.db.value.upsert({
        create: {
          customId,
          deviceId,
          value: parsedValue
        },
        update: {
          value: parsedValue
        },
        where: { deviceId_customId: { customId, deviceId } }
      })
    } catch (err) {
      console.error(err)
    }
  }

  async getValue(deviceId: number, customId: string) {
    return await this.db.value.findUnique({
      where: {
        deviceId_customId: {
          deviceId,
          customId
        }
      }
    })
  }

  async getDeviceValues(deviceId: number) {
    return await this.db.value.findMany({
      where: { deviceId }
    })
  }

  async getCustomIdValues(customId: string) {
    return await this.db.value.findMany({
      where: { customId }
    })
  }

  async getUserValues(user: UserWithTabsAndWidgets) {
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

    return values
  }
}
