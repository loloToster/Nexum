import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

export interface DeviceConfigNode extends nodered.Node {
  client: NexumClient
}

export interface BaseNode extends nodered.Node {
  device: DeviceConfigNode
}

export type UpdateNode = BaseNode
export type ReceiveNode = BaseNode
