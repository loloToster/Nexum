import React, { useState } from "react"
import { View, StyleSheet } from "react-native"

import { FAB, List, Text, Theme, useTheme } from "react-native-paper"
import {
  Tabs as PaperTabs,
  TabScreen as PaperTabScreen
} from "react-native-paper-tabs"

import { TabData } from "src/types"

import { useUser } from "src/contexts/user"
import { useEditing } from "src/contexts/editing"

import Translatable from "src/components/Translatable/Translatable"
import Tab from "src/components/Tab/Tab"
import AddTab from "src/components/AddTab/AddTab"

export interface TabsProps {
  data: TabData[]
  selectedTab?: string | null
  onTabCreate?: (tabName: string) => any
}

function Tabs({ data, selectedTab, onTabCreate = () => null }: TabsProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user } = useUser()

  const [addTabActive, setAddTabActive] = useState(false)

  const renderTabs = () => {
    let tabs = data.map((tab, i) => (
      <PaperTabScreen key={i} label={tab.name}>
        <Tab name={tab.name} widgets={tab.widgets} />
      </PaperTabScreen>
    ))

    if (user?.isAdmin) {
      tabs = tabs.concat(
        <PaperTabScreen key={data.length} label="" icon="plus">
          <AddTab onTabCreate={onTabCreate} />
        </PaperTabScreen>
      )
    }

    return tabs
  }

  let defaultIndex: number | undefined = data.findIndex(
    t => t.name === selectedTab
  )

  if (defaultIndex < 0) defaultIndex = undefined

  return addTabActive ? (
    <AddTab
      onTabCreate={n => {
        setAddTabActive(false)
        onTabCreate(n)
      }}
    />
  ) : !data.length ? (
    <Translatable>
      <View style={styles.noTabsWrapper}>
        <Text style={styles.noTabs}>
          {user?.isAdmin ? (
            <>
              You don&apos;t have access to any tabs. You can add additional
              permissions on Users tab by clicking:
              <List.Icon style={styles.icon} icon="account-multiple" />
              or{" "}
              <Text
                onPress={() => setAddTabActive(true)}
                style={{ textDecorationLine: "underline" }}
              >
                create a new tab
              </Text>
            </>
          ) : (
            <>
              You don&apos;t have access to any tabs. Ask an administrator for
              additional permissions.
            </>
          )}
        </Text>
      </View>
    </Translatable>
  ) : (
    <View style={{ flex: 1 }}>
      {data.length === 1 && !user?.isAdmin ? (
        <Tab name={data[0].name} widgets={data[0].widgets} />
      ) : (
        <PaperTabs defaultIndex={defaultIndex} mode="scrollable">
          {renderTabs()}
        </PaperTabs>
      )}
    </View>
  )
}

export default Tabs

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    noTabsWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center"
    },
    noTabs: {
      fontSize: 20,
      padding: 40,
      textAlign: "center"
    },
    icon: {
      margin: 0,
      height: 30,
      width: 30
    }
  })
}
