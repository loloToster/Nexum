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

  @SubscribeMessage("update-value")
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody("target") target: string,
    @MessageBody("value") value: string | boolean | number
  ) {
    if (!socket.in(target)) return // user tried to update widget not available to him

    const [deviceId, customId] = target.split(/-(.*)/s)

    // send update to every user that can read current target
    socket.broadcast.to(target).emit("update-value", { target, value })

    // send update to devices with id from target
    socket.broadcast
      .to(`device-${deviceId}`)
      .emit("update-value", { customId, value })
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

        socket.join(availableTargets)
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

        socket.join(`device-${device.id}`)
        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
