import React, { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Dimensions, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useTheme, Theme } from "react-native-paper"

import { WidgetData } from "src/types"

import { useEditing } from "src/contexts/editing"

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

  // Handle pos & size changes

  const { registerEdit } = useEditing()

  const editWidget = (
    widgetData: WidgetData,
    newWidgetData: Partial<WidgetData>
  ) => {
    registerEdit({ widgetId: widgetData.id, ...newWidgetData })

    setTabData(prev => {
      const targetWidget = prev.find(w => w.id === widgetData.id)

      if (targetWidget) {
        for (const [key, val] of Object.entries(newWidgetData)) {
          ;(targetWidget as Record<string, any>)[key] = val
        }
      } else {
        console.warn("no target widget found")
      }

      return [...prev]
    })
  }

  const changePos = (widget: WidgetData, x: number, y: number) => {
    const mappedX = x / cellSizeRef.w
    const mappedY = y / cellSizeRef.h

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

    editWidget(widget, { ...bestCoordinates })
  }

  const changeSize = (widget: WidgetData, w: number, h: number) => {
    let width = Math.max(Math.round(w / cellSizeRef.w), 1)
    let height = Math.max(Math.round(h / cellSizeRef.h), 1)

    const verticalOverflow = widget.x + width - COLS
    const horizontalOverflow = widget.y + height - MAX_ROWS

    if (verticalOverflow > 0) width -= verticalOverflow
    if (horizontalOverflow > 0) height -= horizontalOverflow

    for (const w of tabData) {
      if (w.id === widget.id || !collides({ ...widget, width, height }, w))
        continue

      const widthDiff = widget.x + width - w.x
      const heightDiff = widget.y + height - w.y

      if (widget.x < w.x && widget.y < w.y) {
        if (widthDiff < heightDiff) {
          width -= widthDiff
        } else {
          height -= heightDiff
        }
      } else if (widget.x < w.x) {
        width -= widthDiff
      } else if (widget.y < w.y) {
        height -= heightDiff
      } else {
        console.warn("impossible coordinates when resizing")
      }
    }

    editWidget(widget, { width: width, height: height })
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
            onChangePos={changePos}
            onChangeSize={changeSize}
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
