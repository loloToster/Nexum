import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-client",
    function (this: nodered.Node & { client: NexumClient }, config: any) {
      RED.nodes.createNode(this, config)

      this.client = new NexumClient({ host: config.url, token: config.token })
    }
  )
}
