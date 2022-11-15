import { createContext, useContext } from "react"

export type User = {
  id: string
  isAdmin: boolean
} | null

export const UserContext = createContext<{
  user: User
  setUser: (user: User) => void
}>({ user: null, setUser: () => {} })

export const useUser = () => {
  return useContext(UserContext)
}
