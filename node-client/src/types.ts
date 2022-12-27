export interface NexumClientOpts {
  host: string
  token: string
}

export type WidgetValue = string | boolean | number

export type ReceiveCallback = (customId: string, value: WidgetValue) => any
