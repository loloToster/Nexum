import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

import { DeviceConfig, DeviceConfigNode } from "./types"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-client",
    function (this: DeviceConfigNode, config: DeviceConfig) {
      RED.nodes.createNode(this, config)

      const client = new NexumClient({
        host: config.url,
        token: config.token,
        autoConnect: false
      })

      client.connect()

      this.on("close", () => {
        client.disconnect()
      })

      this.client = client
    }
  )
}
