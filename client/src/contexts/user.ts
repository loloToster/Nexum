import { createContext, useContext } from "react"

export type User = {
  id: string
  isAdmin: boolean
} | null

export interface UserContextI {
  user: User
  setUser: (user: User) => void
}

export const UserContext = createContext<UserContextI>({
  user: null,
  setUser: () => null
})

export const useUser = () => {
  return useContext(UserContext)
}
