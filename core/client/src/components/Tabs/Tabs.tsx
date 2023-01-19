import React from "react"
import { View, StyleSheet } from "react-native"

import { List, Text, Theme, useTheme } from "react-native-paper"
import {
  Tabs as PaperTabs,
  TabScreen as PaperTabScreen
} from "react-native-paper-tabs"

import { TabData } from "src/types"

import { useUser } from "src/contexts/user"

import Translatable from "src/components/Translatable/Translatable"
import Tab from "src/components/Tab/Tab"

function Tabs({ data }: { data: TabData[] }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user } = useUser()

  return !data.length ? (
    <Translatable>
      <View style={styles.noTabsWrapper}>
        <Text style={styles.noTabs}>
          {user?.isAdmin ? (
            <>
              You don't have access to any tabs. You can add additional
              permissions on Users tab by clicking:
              <List.Icon style={styles.icon} icon="account-multiple" />
            </>
          ) : (
            <>
              You don't have access to any tabs. Ask an administrator for
              additional permissions.
            </>
          )}
        </Text>
      </View>
    </Translatable>
  ) : data.length === 1 ? (
    <Tab widgets={data[0].widgets} />
  ) : (
    <PaperTabs mode="scrollable">
      {data.map((tab, i) => (
        <PaperTabScreen key={i} label={tab.name}>
          <Tab widgets={tab.widgets} />
        </PaperTabScreen>
      ))}
    </PaperTabs>
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
