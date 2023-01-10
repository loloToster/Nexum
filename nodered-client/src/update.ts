import * as nodered from "node-red"

import { DeviceConfigNode, UpdateConfig, UpdateNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "update",
    function (this: UpdateNode, config: UpdateConfig) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as DeviceConfigNode

      this.on("input", (msg: nodered.NodeMessage) => {
        const customId = config.customId || msg.topic

        if (typeof customId !== "string") {
          this.error("customId cannot be undefined")
          return
        }

        const value = msg.payload

        if (
          typeof value !== "string" ||
          typeof value !== "number" ||
          typeof value !== "boolean"
        ) {
          this.error(
            "type of values/msg.payload can only be a string, number or boolean"
          )
          return
        }

        this.device.client.update(customId, value)
      })

      attachStatus(this)
    }
  )
}
