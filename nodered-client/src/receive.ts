import * as nodered from "node-red"

export = function (RED: nodered.NodeAPI) {
  RED.nodes.registerType("receive", function (this: nodered.Node, config: any) {
    RED.nodes.createNode(this, config)

    // send msg on receive
  })
}
