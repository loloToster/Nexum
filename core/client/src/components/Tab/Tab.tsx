import React, { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Dimensions, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "src/types"
import Widget from "src/components/Widget/Widget"

export interface TabProps {
  name: string
  widgets: WidgetData[]
}

interface Point {
  x: number
  y: number
}

interface Area extends Point {
  width: number
  height: number
}

// https://github.com/gridstack/gridstack.js/blob/master/src/utils.ts#L95
function collides(a: Area, b: Area) {
  return !(
    a.y >= b.y + b.height ||
    a.y + a.height <= b.y ||
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width
  )
}

function squaredDistanceBetweenPoints(a: Point, b: Point) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

const COLS = 8
const MAX_ROWS = 50
const CELL_ASPECT_RATIO = [4, 5]

function Tab({ name, widgets }: TabProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [tabData, setTabData] = useState(widgets)

  useEffect(() => {
    setTabData(widgets)
  }, [widgets])

  // neccessary because widgets dont receive state update and onDragEnd does not work
  const cellSizeRef = useRef({ w: 0, h: 0 }).current
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

  useEffect(() => {
    cellSizeRef.w = cellWidth
    cellSizeRef.h = cellHeight
  }, [cellWidth, cellHeight])

  // neccessary because all widgets are positioned absolutely
  const viewHeight = Math.max(...tabData.map(w => w.height + w.y))

  const onDragEnd = (widget: WidgetData, x: number, y: number) => {
    const mappedX =
      (x % cellSizeRef.w) / cellSizeRef.w + Math.floor(x / cellSizeRef.w)
    const mappedY =
      (y % cellSizeRef.h) / cellSizeRef.w + Math.floor(y / cellSizeRef.h)

    const availableCoordinates: Point[] = []

    for (let y = 0; y < MAX_ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (
          // if overflows vertically
          widget.width + x > COLS ||
          // if overflows horizontaly
          widget.height + y > MAX_ROWS
        )
          continue
        // if overlays other widget (but not itself)
        if (
          tabData.some(w => {
            if (w.id === widget.id) return false

            return collides(w, {
              x,
              y,
              width: widget.width,
              height: widget.height
            })
          })
        )
          continue

        availableCoordinates.push({ x, y })
      }
    }

    const targetPoint = {
      x: mappedX,
      y: mappedY
    }

    const bestCoordinates = availableCoordinates.reduce((prev, cur) => {
      return squaredDistanceBetweenPoints(prev, targetPoint) >
        squaredDistanceBetweenPoints(cur, targetPoint)
        ? cur
        : prev
    })

    setTabData(prev => {
      const targetWidget = prev.find(w => w.id === widget.id)

      if (targetWidget) {
        targetWidget.x = bestCoordinates.x
        targetWidget.y = bestCoordinates.y
      } else {
        console.warn("no target widget found")
      }
      return [...prev]
    })
  }

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
            onDragEnd={onDragEnd}
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
