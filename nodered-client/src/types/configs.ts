import * as nodered from "node-red"

export interface ServerConfig extends nodered.NodeDef {
  url: string
}

export interface DeviceConfig extends nodered.NodeDef {
  server: string
  token: string
}

export interface BaseConfig extends nodered.NodeDef {
  device: string
}

export interface SyncConfig extends BaseConfig {
  customId: string
}

export interface ReceiveConfig extends BaseConfig {
  customId: string
  callOnSync: boolean
}

export interface UpdateConfig extends BaseConfig {
  customId?: string
}
