import React, { useEffect, useRef, useState } from "react"
import { View, StyleSheet, Dimensions, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useTheme, Theme, FAB } from "react-native-paper"

import { WidgetData } from "src/types"
import { createTarget, getTempNegativeId } from "src/utils"
import { defaultComponentHeight, defaultComponentWidth } from "src/consts"

import { useEditing } from "src/contexts/editing"

import Widget, { widgetComponents } from "src/components/Widget/Widget"
import WidgetsModal from "src/components/WidgetsModal/WidgetsModal"
import EditWidgetModal, {
  SubmitData
} from "src/components/EditWidgetModal/EditWidgetModal"

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

  const { registerPosEdit } = useEditing()

  const editWidget = (widgetId: number, newWidgetData: Partial<WidgetData>) => {
    registerPosEdit({ widgetId, ...newWidgetData })
    // todo: register prop edit

    setTabData(prev => {
      const targetWidget = prev.find(w => w.id === widgetId)

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

    editWidget(widget.id, { ...bestCoordinates })
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

    editWidget(widget.id, { width: width, height: height })
  }

  // editing props

  const { editing } = useEditing()

  const [newWidgetModalOpen, setNewWidgetModalOpen] = useState(false)
  const [newWidgetType, setNewWidgetType] = useState(widgetComponents[0].id)
  const [newWidgetPropsModalOpen, setNewWidgetPropsModalOpen] = useState(false)

  const handleNewWidget = (data: SubmitData) => {
    const deviceId = -1 // todo: choose device
    const y = Math.max(...tabData.map(w => w.y + w.height))

    const newWidget: WidgetData = {
      id: getTempNegativeId(),
      customId: data.customId,
      deviceId,
      target: createTarget(deviceId, data.customId),
      type: data.component.id,
      tabId: -1, // todo
      x: 0,
      y,
      width: data.component.defaultSize?.width || defaultComponentWidth,
      height: data.component.defaultSize?.height || defaultComponentHeight,
      value: null,
      properties: data.properties
    }

    setTabData(prev => [...prev, newWidget])
    setNewWidgetPropsModalOpen(false)
  }

  const handleWidgetEdit = (editedWidget: WidgetData) => {
    editWidget(editedWidget.id, editedWidget)
  }

  const handleWidgetDelete = (deletedWidget: WidgetData) => {
    setTabData(prev => prev.filter(w => w.id !== deletedWidget.id))
  }

  return (
    <View style={styles.tab}>
      <ScrollView>
        <WidgetsModal
          open={newWidgetModalOpen}
          onClose={() => setNewWidgetModalOpen(false)}
          onChoice={t => {
            setNewWidgetType(t)
            setNewWidgetModalOpen(false)
            setNewWidgetPropsModalOpen(true)
          }}
        />
        <EditWidgetModal
          open={newWidgetPropsModalOpen}
          newWidgetType={newWidgetType}
          onClose={() => setNewWidgetPropsModalOpen(false)}
          onAdd={handleNewWidget}
        />
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
              onEdit={handleWidgetEdit}
              onDelete={handleWidgetDelete}
            />
          ))}
        </View>
      </ScrollView>
      {editing && (
        <FAB
          icon="view-grid-plus"
          style={styles.fab}
          onPress={() => setNewWidgetModalOpen(true)}
        />
      )}
    </View>
  )
}

export default Tab

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    tab: {
      backgroundColor: theme.colors.background,
      flex: 1
    },
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
