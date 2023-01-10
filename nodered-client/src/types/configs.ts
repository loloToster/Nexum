import * as nodered from "node-red"

export interface DeviceConfig extends nodered.NodeDef {
  url: string
  token: string
}

export interface BaseConfig extends nodered.NodeDef {
  device: string
}

export interface ReceiveConfig extends BaseConfig {
  customId: string
}

export interface UpdateConfig extends BaseConfig {
  customId?: string
}
