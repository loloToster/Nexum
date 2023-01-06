import React from "react"
import {
  Tabs as PaperTabs,
  TabScreen as PaperTabScreen
} from "react-native-paper-tabs"

import { ValueBridgeProvider } from "src/contexts/valueBridge"

import Tab from "src/components/Tab/Tab"
import { TabData } from "src/types"

function Tabs({ data }: { data: TabData[] }) {
  return (
    <ValueBridgeProvider>
      <PaperTabs mode="scrollable">
        {data.map((tab, i) => (
          <PaperTabScreen key={i} label={tab.name}>
            <Tab widgets={tab.widgets}></Tab>
          </PaperTabScreen>
        ))}
      </PaperTabs>
    </ValueBridgeProvider>
  )
}

export default Tabs
