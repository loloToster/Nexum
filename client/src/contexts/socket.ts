import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"

export type ValueUpdateFunc = (obj: {
  customId: string
  value: string | boolean | number
}) => void

export interface EventsMap {
  "update-value": ValueUpdateFunc
}

export const SocketContext = createContext<{
  socket?: Socket<EventsMap, EventsMap>
}>({})

export const useSocket = () => {
  return useContext(SocketContext)
}
