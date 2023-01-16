import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

export interface DeviceConfigNode extends nodered.Node {
  client: NexumClient
}

export interface BaseNode extends nodered.Node {
  device: DeviceConfigNode | null
}

export type SyncNode = BaseNode
export type ReceiveNode = BaseNode
export type UpdateNode = BaseNode
