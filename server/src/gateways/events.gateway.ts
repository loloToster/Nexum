import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

import { DatabaseService } from "src/database/database.service"
import SocketAuthDto from "src/dtos/socketAuth.dto"

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server

  constructor(private db: DatabaseService) {}

  @SubscribeMessage("update-value")
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody("customId") customId: string,
    @MessageBody("value") value: string | boolean | number
  ) {
    socket.broadcast
      .to("users")
      .emit("update-value", { customId, value, ori: socket.id })

    socket.to("devices").emit("update-value", { customId, value })
  }

  @SubscribeMessage("connect")
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { auth, query } = socket.handshake
    const authorization = new SocketAuthDto({ ...auth, ...query })

    switch (authorization.as) {
      case "user": {
        const userExists = Boolean(
          await this.db.user.count({ where: { id: authorization.token } })
        )

        if (!userExists) socket.disconnect()

        socket.join("users")
        break
      }

      case "device": {
        const deviceExists = Boolean(
          await this.db.device.count({ where: { token: authorization.token } })
        )

        if (!deviceExists) socket.disconnect()

        socket.join("devices")
        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
