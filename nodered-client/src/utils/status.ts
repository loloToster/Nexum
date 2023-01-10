import { BaseNode } from "../types"

export function attachStatus(node: BaseNode) {
  const { device } = node

  if (!device) {
    node.status({ fill: "grey", shape: "dot", text: "disabled" })
    return
  }

  const syncStatus = () => {
    device.client.connected
      ? node.status({ fill: "green", shape: "dot", text: "connected" })
      : node.status({ fill: "red", shape: "ring", text: "disconnected" })
  }

  device.client.on("connect", syncStatus)
  device.client.on("disconnect", syncStatus)
  syncStatus()

  node.on("close", () => {
    device.client.off("connect", syncStatus)
    device.client.off("disconnect", syncStatus)
  })
}
