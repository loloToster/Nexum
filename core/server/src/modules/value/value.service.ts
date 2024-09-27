import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { Socket, Server } from "socket.io"

import { RedisService } from "src/modules/redis/redis.service"
import { ValueGateway } from "./value.gateway"
import { UserWithTabsAndWidgets, WidgetValue } from "src/types/types"

@Injectable()
export class ValueService {
  constructor(
    private redis: RedisService,
    @Inject(forwardRef(() => ValueGateway))
    private valueGateway: ValueGateway
  ) {}

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

  async updateValue(
    origin: Socket | Server | null,
    target: string,
    value: WidgetValue
  )
  async updateValue(
    origin: Socket | Server | null,
    customId: string,
    deviceId: number,
    value: WidgetValue
  )
  async updateValue(
    origin: Socket | Server | null,
    targetOrCustomId: string,
    deviceIdOrValue: WidgetValue | number,
    valueOrUndefined?: WidgetValue
  ) {
    origin = origin ?? this.valueGateway.server
    const updater = origin instanceof Server ? origin : origin.broadcast

    let value: WidgetValue, target: string, deviceId: number, customId: string

    if (valueOrUndefined === undefined) {
      // 1st overload
      value = deviceIdOrValue
      target = targetOrCustomId
      const parsedTarget = this.parseTarget(target)
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

    await this.redis.set(target, parsedValue)
  }

  async getValue(deviceId: number, customId: string): Promise<WidgetValue> {
    return JSON.parse(
      await this.redis.get(this.createTarget(deviceId, customId))
    )
  }

  async getDeviceValues(deviceId: number) {
    const targets = await this.redis.keys(this.createTarget(deviceId, "*"))
    const values = await this.redis.get(targets)

    const parsedValues: Array<{ customId: string; value: WidgetValue }> = []

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const value = JSON.parse(values[i])
      const { customId } = this.parseTarget(target)

      parsedValues.push({ customId, value })
    }

    return parsedValues
  }

  async getUserValues(user: UserWithTabsAndWidgets) {
    const userTargets = user.tabs
      .map(t => t.widgets)
      .flat()
      .map(w => this.createTarget(w.deviceId, w.customId))

    const values = await this.redis.get(userTargets)

    const map: Array<{ target: string; value: WidgetValue }> = []

    for (let i = 0; i < userTargets.length; i++) {
      const target = userTargets[i]
      const value = JSON.parse(values[i])

      map.push({ target, value })
    }

    return map
  }
}
