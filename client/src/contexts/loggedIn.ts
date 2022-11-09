import { createContext, useContext } from "react"

export const LoggedInContext = createContext<{
  loggedIn: boolean
  setLoggedIn: (val: boolean) => void
}>({ loggedIn: false, setLoggedIn: () => {} })

export const useLoggedIn = () => {
  return useContext(LoggedInContext)
}
