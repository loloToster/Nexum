import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

import { ValueService } from "./value.service"
import { DeviceService } from "src/device/device.service"
import { UserService } from "src/user/user.service"

import SocketAuthDto from "src/dtos/socketAuth.dto"

@WebSocketGateway({ cors: true })
export class ValueGateway {
  @WebSocketServer()
  server: Server

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
      console.warn(
        "Someone was connected without being in a 'users' or 'devices' room"
      )

      socket.disconnect()
      return
    }

    this.valueService.updateValue(socket, target, value)
  }

  @SubscribeMessage("connect")
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { auth, query } = socket.handshake
    const authorization = new SocketAuthDto({ ...auth, ...query })

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

        socket.data.id = device.id
        socket.join(["devices", `device-${device.id}`])
        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
