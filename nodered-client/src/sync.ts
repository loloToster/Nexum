import * as nodered from "node-red"
import { SyncCallback } from "nexum-client"

import { DeviceConfigNode, SyncConfig, SyncNode } from "./types"
import { attachStatus } from "./utils"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType("sync", function (this: SyncNode, config: SyncConfig) {
    RED.nodes.createNode(this, config)

    this.device = RED.nodes.getNode(config.device) as DeviceConfigNode | null

    const listener: SyncCallback = values => {
      values.forEach(v => {
        if (v.customId === config.customId) this.send({ payload: v.value })
      })
    }

    this.device?.client.on("sync", listener)

    this.on("close", () => {
      this.device?.client.off("sync", listener)
    })

    attachStatus(this)
  })
}
