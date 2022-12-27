import React, { useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Theme, useTheme } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"

import { TabData } from "src/types"

import { useSocket } from "src/contexts/socket"

import useForceRerender from "src/hooks/useForceRerender"

import Tabs from "src/components/Tabs/Tabs"
import Error from "src/components/Error/Error"

function Widgets() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const rerender = useForceRerender()

  const { socket } = useSocket()

  // connect socket only if this components is mounted
  useEffect(() => {
    if (!socket) return

    socket.on("connect", rerender)
    socket.on("disconnect", rerender)

    socket.connect()

    return () => {
      socket.off("connect", rerender)
      socket.off("disconnect", rerender)
      socket.disconnect()
    }
  }, [socket])

  const { isLoading, isError, data } = useQuery("me", async () => {
    const res = await api.get("/users/me")
    return res.data
  })

  return isLoading || socket?.disconnected ? (
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
