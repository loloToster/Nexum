import * as nodered from "node-red"
import { ReceiveCallback, SyncCallback } from "nexum-client"

import { DeviceConfigNode, ReceiveConfig, ReceiveNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "receive",
    function (this: ReceiveNode, config: ReceiveConfig) {
      RED.nodes.createNode(this, config)

      this.device = RED.nodes.getNode(config.device) as DeviceConfigNode | null

      const listener: ReceiveCallback = (customId, value) => {
        if (customId === config.customId) {
          this.send({ payload: value })
        }
      }

      this.device?.client.on("receive", listener)

      this.on("close", () => {
        this.device?.client.off("receive", listener)
      })

      if (config.callOnSync) {
        const syncListener: SyncCallback = values => {
          values.forEach(v => {
            if (v.customId === config.customId) listener(v.customId, v.value)
          })
        }

        this.device?.client.on("sync", syncListener)

        this.on("close", () => {
          this.device?.client.off("sync", syncListener)
        })
      }

      attachStatus(this)
    }
  )
}
