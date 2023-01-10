import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

import { DeviceConfigNode } from "./types"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-client",
    function (this: DeviceConfigNode, config: any) {
      RED.nodes.createNode(this, config)

      this.client = new NexumClient({ host: config.url, token: config.token })
    }
  )
}
