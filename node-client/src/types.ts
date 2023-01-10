export interface NexumClientOpts {
  host: string
  token: string
  autoConnect?: boolean
}

export type WidgetValue = string | boolean | number

export type ReceiveCallback = (customId: string, value: WidgetValue) => any
export type ConnectCallback = () => any
export type DisonnectCallback = () => any

export type NexumEvents = {
  receive: ReceiveCallback
  connect: ConnectCallback
  disconnect: DisonnectCallback
}
