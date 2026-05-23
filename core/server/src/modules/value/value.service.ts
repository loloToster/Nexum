import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import { Socket, Server } from "socket.io"
import { io, Socket as ClientSocket } from "socket.io-client"

import { RedisService } from "src/modules/redis/redis.service"
import { GoogleSmarthomeService } from "../gglsmarthome/gglsmarthome.service"
import { ValueGateway } from "./value.gateway"

import { UserWithTabsAndWidgets, WidgetValue } from "src/types/types"
import { DeviceService } from "../device/device.service"

@Injectable()
export class ValueService {
  readonly slaveSocket: ClientSocket
  private readonly logger = new Logger(ValueService.name)

  constructor(
    private redis: RedisService,
    @Inject(forwardRef(() => ValueGateway))
    private valueGateway: ValueGateway,
    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,
    @Inject(forwardRef(() => GoogleSmarthomeService))
    private gglSmarthomeService: GoogleSmarthomeService
  ) {
    if (process.env.MASTER_SERVER && process.env.MASTER_SERVER_TOKEN)
      this.slaveSocket = this.connectToMaster()
  }

  connectToMaster() {
    this.logger.log(`connecting to master at '${process.env.MASTER_SERVER}'`)

    const slaveSocket = io(process.env.MASTER_SERVER, {
      autoConnect: false,
      reconnection: true,
      auth: { as: "slave", token: process.env.MASTER_SERVER_TOKEN }
    })

    slaveSocket.on("connect", () => this.logger.log("connected to master"))
    slaveSocket.on("disconnect", () =>
      this.logger.log("disconnected from master")
    )

    slaveSocket.on("devices", async ({ devices }) => {
      this.logger.log("Syncing devices with master...")
      await this.deviceService.overrideDevices(devices)
      this.logger.log("Devices synced with master")
    })

    slaveSocket.on("update-value", ({ target, value }) => {
      this.logger.log(`master changed value of '${target}' to '${value}'`)
      this.updateValue("master", target, value)
    })

    slaveSocket.connect()

    return slaveSocket
  }

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
    origin: Socket | Server | "googlehome" | "master",
    target: string,
    value: WidgetValue
  )
  async updateValue(
    origin: Socket | Server | "googlehome" | "master",
    customId: string,
    deviceId: number,
    value: WidgetValue
  )
  async updateValue(
    origin: Socket | Server | "googlehome" | "master",
    targetOrCustomId: string,
    deviceIdOrValue: WidgetValue | number,
    valueOrUndefined?: WidgetValue
  ) {
    const updater =
      origin === "googlehome" || origin === "master"
        ? this.valueGateway.server
        : origin instanceof Server
          ? origin
          : origin.broadcast

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

    // send update to every slave except the one that updated
    const isSlave = origin instanceof Socket && origin.in("slaves")
    updater
      .to("slaves")
      .except(isSlave ? `slave-${origin.data.id}` : [])
      .emit("update-value", { target, value })

    // send update to every user that can read current target
    updater.to(target).emit("update-value", { target, value })

    // send update to devices with id from target
    updater.to(`device-${deviceId}`).emit("update-value", { customId, value })

    // save value in db
    const parsedValue = JSON.stringify(value)

    await this.redis.set(target, parsedValue)

    if (origin !== "googlehome")
      this.gglSmarthomeService.reportStateToHomegraph(deviceId, customId)

    if (origin !== "master")
      this.slaveSocket?.emit("update-value", { target, value })
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
