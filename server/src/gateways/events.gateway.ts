import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

import { DatabaseService } from "../database/database.service"

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
  }

  @SubscribeMessage("connect")
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { auth } = socket.handshake

    switch (auth.as) {
      case "user": {
        const userExists = Boolean(
          await this.db.user.count({ where: { id: auth.token } })
        )
        socket.join("users")
        if (!userExists) socket.disconnect()
        break
      }

      default: {
        socket.disconnect()
      }
    }
  }
}
