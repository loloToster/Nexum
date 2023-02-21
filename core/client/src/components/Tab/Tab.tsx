import React, { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "src/types"
import Widget from "src/components/Widget/Widget"

export interface TabProps {
  name: string
  widgets: WidgetData[]
}

function Tab({ name, widgets }: TabProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [tabData, setTabData] = useState(widgets)

  useEffect(() => {
    setTabData(widgets)
  }, [widgets])

  const COLS = 8
  const CELL_ASPECT_RATIO = [4, 5]

  const [cellWidth, setCellWidth] = useState(
    Dimensions.get("window").width / COLS
  )
  const [cellHeight, setCellHeight] = useState(0)

  useEffect(() => {
    AsyncStorage.setItem("tab", name)

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

  // neccessary because all widgets are positioned absolutely
  const viewHeight = Math.max(...tabData.map(w => w.height + w.y))

  return (
    <ScrollView style={styles.tab}>
      <View
        style={{
          minHeight: isFinite(viewHeight) ? viewHeight * cellHeight : 0
        }}
      >
        {tabData.map((widgetData, i) => (
          <Widget
            key={i}
            data={widgetData}
            width={cellWidth * widgetData.width}
            height={cellHeight * widgetData.height}
            top={cellHeight * widgetData.y}
            left={cellWidth * widgetData.x}
          />
        ))}
      </View>
    </ScrollView>
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
