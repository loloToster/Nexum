import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

import { DeviceConfig, DeviceConfigNode, ServerConfigNode } from "./types"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-client",
    function (this: DeviceConfigNode, config: DeviceConfig) {
      RED.nodes.createNode(this, config)

      this.server = RED.nodes.getNode(config.server) as ServerConfigNode | null

      const client = new NexumClient({
        host: this.server?.url || "", // TODO: dont create a client if the server node is null
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
