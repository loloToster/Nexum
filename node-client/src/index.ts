import { io, Socket } from "socket.io-client"
import TypedEmitter from "typed-emitter"
import EventEmitter from "events"

import { NexumClientOpts, NexumEvents, WidgetValue } from "./types"

export class NexumClient extends (EventEmitter as new () => TypedEmitter<NexumEvents>) {
  private socket: Socket

  constructor({ host, token, autoConnect = true }: NexumClientOpts) {
    super()

    this.socket = io(host, { auth: { as: "device", token }, autoConnect })

    this.socket.on("update-value", data => {
      this.emit("receive", data.customId, data.value)
    })

    this.socket.on("connect", () => {
      this.emit("connect")
    })

    this.socket.on("disconnect", () => {
      this.emit("disconnect")
    })
  }

  update(customId: string, value: WidgetValue) {
    this.socket.emit("update-value", { customId, value })
  }

  get connected() {
    return this.socket.connected
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }
}
