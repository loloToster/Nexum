import { io, Socket } from "socket.io-client"
import EventEmitter from "events"

import { NexumClientOpts, NexumEvents, WidgetValue } from "./types"

export class NexumClient extends EventEmitter {
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

  on<K extends keyof NexumEvents>(event: K, listener: NexumEvents[K]) {
    return super.on(event, listener)
  }

  once<K extends keyof NexumEvents>(event: K, listener: NexumEvents[K]) {
    return super.once(event, listener)
  }

  off<K extends keyof NexumEvents>(event: K, listener: NexumEvents[K]) {
    return super.off(event, listener)
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
