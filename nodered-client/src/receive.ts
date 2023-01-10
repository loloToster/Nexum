import * as nodered from "node-red"

import { DeviceConfigNode, ReceiveConfig, ReceiveNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "receive",
    function (this: ReceiveNode, config: ReceiveConfig) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as DeviceConfigNode

      this.device.client.on("receive", (customId, value) => {
        if (customId === config.customId) {
          this.send({ payload: value })
        }
      })

      attachStatus(this)
    }
  )
}
