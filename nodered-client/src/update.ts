import * as nodered from "node-red"

import { DeviceConfigNode, UpdateConfig, UpdateNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "update",
    function (this: UpdateNode, config: UpdateConfig) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as DeviceConfigNode | null

      this.on("input", (msg, send, done) => {
        const customId = config.customId || msg.topic

        if (typeof customId !== "string") {
          done(new Error("Custom Id cannot be undefined"))
          return
        }

        const value = msg.payload

        if (
          typeof value !== "string" &&
          typeof value !== "number" &&
          typeof value !== "boolean"
        ) {
          done(new Error("Value can only be a string, number or boolean"))
          return
        }

        this.device?.client.update(customId, value)
      })

      attachStatus(this)
    }
  )
}
