import { io, Socket } from "socket.io-client"

import { NexumClientOpts, ReceiveCallback, WidgetValue } from "./types"

export class NexumClient {
  private socket: Socket

  private receiveCb: ReceiveCallback | null
  private connectCb: (() => any) | null
  private disconnectCb: (() => any) | null

  constructor({ host, token }: NexumClientOpts) {
    this.socket = io(host, { auth: { as: "device", token } })

    this.receiveCb = null
    this.connectCb = null
    this.disconnectCb = null

    this.socket.on("update-value", data => {
      if (this.receiveCb) this.receiveCb(data.customId, data.value)
    })

    this.socket.on("connect", () => {
      if (this.connectCb) this.connectCb()
    })

    this.socket.on("disconnect", () => {
      if (this.disconnectCb) this.disconnectCb()
    })
  }

  onReceive(listener: ReceiveCallback | null) {
    this.receiveCb = listener
  }

  onConnect(listener: (() => any) | null) {
    this.connectCb = listener
  }

  onDisconnect(listener: (() => any) | null) {
    this.disconnectCb = listener
  }

  update(customId: string, value: WidgetValue) {
    this.socket.emit("update-value", { customId, value })
  }

  get connected() {
    return this.socket.connected
  }
}
