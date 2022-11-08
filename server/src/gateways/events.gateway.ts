import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets"

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server

  @SubscribeMessage("message")
  handleMessage(@MessageBody() message: string) {
    console.log(message)
    this.server.emit("message", message)
  }
}
