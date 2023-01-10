import { BaseNode } from "../types"

export function attachStatus(node: BaseNode) {
  const syncStatus = () => {
    node.device.client.connected
      ? node.status({ fill: "green", shape: "dot", text: "connected" })
      : node.status({ fill: "red", shape: "ring", text: "disconnected" })
  }

  node.device.client.on("connect", syncStatus)
  node.device.client.on("disconnect", syncStatus)
  syncStatus()
}
