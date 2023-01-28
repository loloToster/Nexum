import * as nodered from "node-red"
import { NexumClient } from "nexum-client"

export interface ServerConfigNode extends nodered.Node {
  url: string
}

export interface DeviceConfigNode extends nodered.Node {
  server: ServerConfigNode | null
  client: NexumClient
}

export interface BaseNode extends nodered.Node {
  device: DeviceConfigNode | null
}

export type SyncNode = BaseNode
export type ReceiveNode = BaseNode
export type UpdateNode = BaseNode
