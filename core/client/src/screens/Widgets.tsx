import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Theme, useTheme } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"

import { TabData } from "src/types"

import { useSocket } from "src/contexts/socket"
import {
  ValueBridgeProvider,
  ValueBridgeContext
} from "src/contexts/valueBridge"

import Tabs from "src/components/Tabs/Tabs"
import Error from "src/components/Error/Error"

function Widgets() {
  const theme = useTheme()
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

  const { isLoading, isError, data } = useQuery("me", async () => {
    const res = await api.get("/users/me")
    return res.data
  })

  return (
    <ValueBridgeProvider>
      <ValueBridgeContext.Consumer>
        {({ synced }) =>
          isLoading || !connected || !synced ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          ) : isError ? (
            <Error text="Could not load widgets" />
          ) : (
            <Tabs data={data.tabs as TabData[]} />
          )
        }
      </ValueBridgeContext.Consumer>
    </ValueBridgeProvider>
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
