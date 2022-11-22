import React, { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { BaseUser } from "src/types"

import useAfterMountEffect from "src/hooks/useAfterMountEffect"

export interface UserContextI {
  user: BaseUser
  setUser: (user: BaseUser) => void
}

export async function getUserFromStorage(): Promise<BaseUser | null> {
  const encodedUser = await AsyncStorage.getItem("user")
  if (!encodedUser) return null
  const user = JSON.parse(encodedUser)
  return user
}

export async function setUserInStorage(user: BaseUser | null): Promise<void> {
  if (!user) return await AsyncStorage.removeItem("user")
  else await AsyncStorage.setItem("user", JSON.stringify(user))
}

const UserContext = createContext<UserContextI>({
  user: null,
  setUser: () => null
})

export const UserProvider = (props: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BaseUser | null>(null)

  // set initial user on load
  useEffect(() => {
    getUserFromStorage().then(u => setUser(u))
  }, [])

  // update storage on state update
  useAfterMountEffect(() => {
    setUserInStorage(user)
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  )
}

export const UserContextConsumer = UserContext.Consumer

export const useUser = () => {
  return useContext(UserContext)
}
