import * as nodered from "node-red"
import { WidgetValue } from "nexum-client/dist/types"

import { DeviceConfigNode, ReceiveConfig, ReceiveNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "receive",
    function (this: ReceiveNode, config: ReceiveConfig) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as DeviceConfigNode | null

      const listener = (customId: string, value: WidgetValue) => {
        if (customId === config.customId) {
          this.send({ payload: value })
        }
      }

      this.device?.client.on("receive", listener)

      this.on("close", () => {
        this.device?.client.off("receive", listener)
      })

      attachStatus(this)
    }
  )
}
