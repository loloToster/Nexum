import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets"
import { Logger } from "@nestjs/common"

import { Server, Socket as RawSocket } from "socket.io"

import { Device, User } from "@prisma/client"

import { ValueService } from "./value.service"
import { DeviceService } from "src/device/device.service"
import { UserService } from "src/user/user.service"

import SocketAuthDto from "src/dtos/socketAuth.dto"

type Socket = RawSocket<undefined, undefined, undefined, User | Device>

@WebSocketGateway({ cors: true })
export class ValueGateway {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ValueGateway.name)

  constructor(
    private valueService: ValueService,
    private deviceService: DeviceService,
    private userService: UserService
  ) {}

  @SubscribeMessage("update-value")
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody("target") target: string,
    @MessageBody("customId") customId: string,
    @MessageBody("value") value: string | boolean | number
  ) {
    if (socket.rooms.has("users")) {
      // user tried to update widget not available to him
      if (!socket.rooms.has(target)) return
    } else if (socket.rooms.has("devices")) {
      const deviceId = socket.data.id
      target = `${deviceId}-${customId}`
    } else {
      this.logger.warn(
        "Someone was connected without being in a 'users' or 'devices' room"
      )

      socket.disconnect()
      return
    }

    const origin = socket.rooms.has("users") ? "user" : "device"

    this.logger.log(
      `${origin} named: '${socket.data.name}' changed value of '${target}' to '${value}'`
    )

    this.valueService.updateValue(socket, target, value)
  }

  @SubscribeMessage("connect")
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { auth, query } = socket.handshake
    const authorization = new SocketAuthDto({ ...auth, ...query })

    this.logger.log(
      `connection attempt as ${authorization.as} with token: '${authorization.token}'`
    )

    switch (authorization.as) {
      case "user": {
        const user = await this.userService.getUserById(authorization.token)
        if (!user) {
          socket.disconnect()
          break
        }

        // targets that the user can read and write to
        const availableTargets = [
          ...new Set(user.tabs.map(t => t.widgets.map(w => w.target)).flat())
        ]

        socket.join(["users", ...availableTargets])

        socket.data = user

        this.logger.log(`user named: '${user.name}' successfully connected`)

        socket.on("disconnect", () => {
          this.logger.log(`user named: '${user.name}' disconnected`)
        })

        break
      }

      case "device": {
        const device = await this.deviceService.getDeviceByToken(
          authorization.token
        )

        if (!device) {
          socket.disconnect()
          break
        }

        socket.join(["devices", `device-${device.id}`])

        socket.data = device

        this.logger.log(`device named: '${device.name}' successfully connected`)

        socket.on("disconnect", () => {
          this.logger.log(`device named: '${device.name}' disconnected`)
        })

        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
