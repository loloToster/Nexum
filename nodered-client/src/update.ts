import * as nodered from "node-red"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType("update", function (this: nodered.Node, config: any) {
    RED.nodes.createNode(this, config)

    this.on("input", (msg: any) => {
      console.log(msg)
    })
  })
}
