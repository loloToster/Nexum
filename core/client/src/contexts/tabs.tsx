import React, { createContext, useContext, useState } from "react"
import { TabData } from "src/types"

export interface TabsContextI {
  tabs: TabData[]
  setTabs: React.Dispatch<React.SetStateAction<TabData[]>>
}

const TabsContext = createContext<TabsContextI>({
  tabs: [],
  setTabs: () => null
})

export const TabsProvider = (props: { children: React.ReactNode }) => {
  const [tabs, setTabs] = useState<TabData[]>([])

  return (
    <TabsContext.Provider value={{ tabs, setTabs }}>
      {props.children}
    </TabsContext.Provider>
  )
}

export const TabsContextConsumer = TabsContext.Consumer

export const useTabs = () => {
  return useContext(TabsContext)
}
