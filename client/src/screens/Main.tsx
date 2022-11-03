import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Theme, useTheme } from "react-native-paper"

import { TabData } from "../components/Tab/types"
import Tabs from "../components/Tabs/Tabs"

function Main() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [data, setData] = useState<TabData[]>(null)

  // fetch widgets
  useEffect(() => {
    setTimeout(() => {
      setData([
        {
          name: "Tab with btns",
          widgets: [
            { type: "gauge", x: 0, y: 1, w: 4, h: 2 },
            {
              type: "btn",
              x: 1,
              y: 0,
              w: 2,
              h: 1
            }
          ]
        },
        {
          name: "Empty Tab",
          widgets: [{ type: "x", x: 1, y: 1, w: 2, h: 1 }]
        }
      ])
    }, 500)
  }, [])

  return data ? (
    <Tabs data={data} />
  ) : (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default Main

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
