import { createContext } from "react"

export const LoggedInContext = createContext<{
  loggedIn: boolean
  setLoggedIn: (val: boolean) => void
}>({ loggedIn: false, setLoggedIn: () => {} })
