import * as nodered from "node-red"

import { ServerConfig, ServerConfigNode } from "./types"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-server",
    function (this: ServerConfigNode, config: ServerConfig) {
      RED.nodes.createNode(this, config)
      this.url = config.url
    }
  )
}
