import React from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Theme, useTheme } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"

import { TabData } from "src/components/Tab/types"
import Tabs from "src/components/Tabs/Tabs"
import Error from "src/components/Error/Error"

function Widgets() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { isLoading, isError, data } = useQuery("me", async () => {
    const res = await api.get("/users/me")
    return res.data
  })

  return isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
    </View>
  ) : isError ? (
    <Error text="Could not load widgets" />
  ) : (
    <Tabs data={data.tabs as TabData[]} />
  )
}

export default Widgets

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    loading: {
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }
  })
}