import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

import { DatabaseService } from "src/database/database.service"
import { UserService } from "src/user/user.service"

import SocketAuthDto from "src/dtos/socketAuth.dto"

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server

  constructor(private db: DatabaseService, private userService: UserService) {}

  sendUpdate(
    sender: Socket,
    target: string,
    customId: string,
    deviceId: string,
    value: string | boolean | number
  ) {
    // send update to every user that can read current target
    sender.broadcast.to(target).emit("update-value", { target, value })

    // send update to devices with id from target
    sender.broadcast
      .to(`device-${deviceId}`)
      .emit("update-value", { customId, value })
  }

  @SubscribeMessage("update-value")
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody("target") target: string,
    @MessageBody("customId") customId: string,
    @MessageBody("value") value: string | boolean | number
  ) {
    let deviceId: string

    if (socket.rooms.has("users")) {
      // user tried to update widget not available to him
      if (!socket.rooms.has(target)) return

      const parsedTarget = target.split(/-(.*)/s) // split on first occurance
      deviceId = parsedTarget[0]
      customId = parsedTarget[1]
    } else if (socket.rooms.has("devices")) {
      deviceId = socket.data.id
      target = `${deviceId}-${customId}`
    } else {
      console.warn(
        "Someone was connected without being in a 'users' or 'devices' room"
      )

      socket.disconnect()
      return
    }

    this.sendUpdate(socket, target, customId, deviceId, value)
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
        const device = await this.db.device.findUnique({
          where: { token: authorization.token }
        })

        if (!device) {
          socket.disconnect()
          break
        }

        socket.data.id = device.id.toString()
        socket.join(["devices", `device-${device.id}`])
        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
