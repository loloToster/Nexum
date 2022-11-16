import React, { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions, Platform } from "react-native"
import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "src/components/Widget/types"
import Widget from "src/components/Widget/Widget"

function Tab({ widgets }: { widgets: WidgetData[] }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [cellWidth, setCellWidth] = useState(Dimensions.get("window").width / 4)

  if (Platform.OS === "web")
    useEffect(() => {
      const resizeHandler = () =>
        setCellWidth(Dimensions.get("window").width / 4)
      window.addEventListener("resize", resizeHandler)
      return () => window.removeEventListener("resize", resizeHandler)
    }, [])

  return (
    <View style={styles.tab}>
      {widgets.map((widgetData, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: cellWidth * widgetData.width,
            // ratio of cell is 4/5
            height: (cellWidth / 4) * 5 * widgetData.height,
            left: cellWidth * widgetData.x,
            top: (cellWidth / 4) * 5 * widgetData.y
          }}
        >
          <Widget {...widgetData} />
        </View>
      ))}
    </View>
  )
}

export default Tab

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    tab: {
      backgroundColor: theme.colors.background,
      flex: 1
    }
  })
}
