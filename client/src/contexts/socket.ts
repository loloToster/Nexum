import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"

import { WidgetValue } from "src/types"

export interface ValueUpdateObj {
  customId: string
  value: WidgetValue
}

export type ValueUpdateFunc = (obj: ValueUpdateObj) => void

export interface EventsMap {
  "update-value": ValueUpdateFunc
}

export const SocketContext = createContext<{
  socket?: Socket<EventsMap, EventsMap>
}>({})

export const useSocket = () => {
  return useContext(SocketContext)
}
