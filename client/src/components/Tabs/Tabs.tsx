import {
  Tabs as PaperTabs,
  TabScreen as PaperTabScreen
} from "react-native-paper-tabs"

import Tab from "../Tab/Tab"
import { TabData } from "../Tab/types"

function Tabs({ data }: { data: TabData[] }) {
  return (
    <PaperTabs mode="scrollable">
      {data.map((tab, i) => (
        <PaperTabScreen key={i} label={tab.name}>
          <Tab widgets={tab.widgets}></Tab>
        </PaperTabScreen>
      ))}
    </PaperTabs>
  )
}

export default Tabs