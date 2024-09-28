import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { ActivityIndicator, MD2Theme, useTheme } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"

import { useSocket } from "src/contexts/socket"
import {
  ValueBridgeProvider,
  ValueBridgeContext
} from "src/contexts/valueBridge"
import { useTabs } from "src/contexts/tabs"

import Tabs from "src/components/Tabs/Tabs"
import Error from "src/components/Error/Error"

function Widgets() {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const { socket } = useSocket()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [socket])

  const { isLoading, isError, data } = useQuery(
    "me",
    async () => {
      const res = await api.get("/users/me")
      return res.data
    },
    { staleTime: Infinity, cacheTime: Infinity }
  )

  const { tabs, setTabs } = useTabs()

  useEffect(() => {
    if (data) setTabs(data.tabs)
  }, [data])

  const [selectedTab, setSelectedTab] = useState<string | null>()

  useEffect(() => {
    AsyncStorage.getItem("tab", (err, tab) => {
      tab = tab || null
      setSelectedTab(tab)
    })
  }, [])

  return (
    <ValueBridgeProvider>
      <ValueBridgeContext.Consumer>
        {({ synced }) =>
          isLoading || !connected || !synced || selectedTab === undefined ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          ) : isError ? (
            <Error text="Could not load widgets" />
          ) : (
            <Tabs
              data={tabs}
              selectedTab={selectedTab}
              onTabCreate={(id, name) =>
                setTabs(prev => [...prev, { id, name, widgets: [] }])
              }
            />
          )
        }
      </ValueBridgeContext.Consumer>
    </ValueBridgeProvider>
  )
}

export default Widgets

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    loading: {
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }
  })
}
