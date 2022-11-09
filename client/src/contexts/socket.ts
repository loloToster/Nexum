import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"

export const SocketContext = createContext<{ socket?: Socket }>({})

export const useSocket = () => {
  return useContext(SocketContext)
}
