import * as nodered from "node-red"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType(
    "nexum-client",
    function (this: nodered.Node & { url: string }, config: any) {
      RED.nodes.createNode(this, config)

      this.url = config.url
    }
  )
}
