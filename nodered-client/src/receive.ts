import { NexumClient } from "nexum-client"
import * as nodered from "node-red"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "receive",
    function (
      this: nodered.Node & { device: nodered.Node & { client: NexumClient } },
      config: any
    ) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as any

      this.device.client.on("receive", (customId, value) => {
        if (customId === config.customId) {
          this.send({ payload: value })
        }
      })

      const syncStatus = () => {
        this.device.client.connected
          ? this.status({ fill: "green", shape: "dot", text: "connected" })
          : this.status({ fill: "red", shape: "ring", text: "disconnected" })
      }

      this.device.client.on("connect", syncStatus)
      this.device.client.on("disconnect", syncStatus)
      syncStatus()
    }
  )
}
