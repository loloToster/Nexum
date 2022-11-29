import React, { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "src/types"
import Widget from "src/components/Widget/Widget"

function Tab({ widgets }: { widgets: WidgetData[] }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const COLS = 8
  const CELL_ASPECT_RATIO = [4, 5]

  const [cellWidth, setCellWidth] = useState(
    Dimensions.get("window").width / COLS
  )
  const [cellHeight, setCellHeight] = useState(0)

  useEffect(() => {
    const listener = Dimensions.addEventListener(
      "change",
      ({ window: { width } }) => {
        setCellWidth(width / COLS)
      }
    )

    return () => listener.remove()
  }, [])

  useEffect(() => {
    setCellHeight((cellWidth / CELL_ASPECT_RATIO[0]) * CELL_ASPECT_RATIO[1])
  }, [cellWidth])

  return (
    <View style={styles.tab}>
      {widgets.map((widgetData, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: cellWidth * widgetData.width,
            height: cellHeight * widgetData.height,
            left: cellWidth * widgetData.x,
            top: cellHeight * widgetData.y
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
