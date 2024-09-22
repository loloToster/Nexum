import React, { useEffect, useRef, useState } from "react"
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableWithoutFeedback
} from "react-native"
import { Text, useTheme, Colors, Theme, List } from "react-native-paper"

import {
  WidgetProperties,
  WidgetData,
  WidgetValue,
  WidgetProperty
} from "src/types"
import { DEF_WIDGET_PROPS } from "src/consts"
import { fillWithValues } from "src/utils"

import {
  EmitTarget,
  LocalValueUpdateObj,
  useValueBridge
} from "src/contexts/valueBridge"
import { useEditing } from "src/contexts/editing"

import EditWidgetModal, {
  SubmitData
} from "src/components/EditWidgetModal/EditWidgetModal"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"

import Button from "./Button/Button"
import SliderWidget from "./Slider/Slider"
import Gauge from "./Gauge/Gauge"
import Label from "./Label/Label"
import NumberInput from "./NumberInput/NumberInput"

export { EmitTarget } from "src/contexts/valueBridge"

export type SetWidgetValueAction<T> = {
  (newVal: React.SetStateAction<T>): void
  // onlyServer option is used to prevent infinite loop
  (newVal: T, target?: EmitTarget): void
}

export type WidgetValueHook = <T = WidgetValue>(
  initialValue: T
) => [T, SetWidgetValueAction<T>]

export interface ChoosenWidgetProps extends Omit<WidgetData, "properties"> {
  properties: WidgetProperties
  useWidgetValue: WidgetValueHook
}

export interface WidgetComponent {
  component: ((props: ChoosenWidgetProps) => JSX.Element) | (() => JSX.Element)
  id: string
  name: string
  editableProperties: WidgetProperty[]
  icon?: string
  defaultSize?: {
    width: number
    height: number
  }
}

export const widgetComponents: WidgetComponent[] = [
  Button,
  SliderWidget,
  Gauge,
  Label,
  NumberInput
]

export interface WidgetProps {
  data: WidgetData
  width: number
  height: number
  left: number
  top: number
  onChangePos: (widget: WidgetData, x: number, y: number) => any
  onChangeSize: (widget: WidgetData, w: number, h: number) => any
  onEdit: (widget: WidgetData) => void
  onDelete: (widget: WidgetData) => void
}

function Widget({
  data,
  width,
  height,
  left,
  top,
  onChangePos,
  onChangeSize,
  onEdit,
  onDelete
}: WidgetProps) {
  const dataRef = useRef<WidgetData>(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const theme = useTheme()
  const styles = getStyles(theme)

  const ChoosenWidget =
    widgetComponents.find(c => c.id === data.type)?.component || Unknown

  const useWidgetValue: WidgetValueHook = initialValue => {
    const { bridge, values, emit: rawEmit } = useValueBridge()
    const emit = (val: WidgetValue, target: EmitTarget) => {
      rawEmit(dataRef.current, val, target)
    }

    if (values[dataRef.current.target] !== undefined)
      initialValue = values[dataRef.current.target] as typeof initialValue
    else if (
      dataRef.current.value !== null &&
      typeof initialValue == typeof dataRef.current.value
    )
      initialValue = dataRef.current.value as typeof initialValue

    const [widgetValue, setWidgetValue] = useState(initialValue)

    useEffect(() => {
      const listener = (obj: LocalValueUpdateObj) => {
        if (
          obj.target === dataRef.current.target &&
          typeof obj.value === typeof initialValue &&
          obj.widgetId !== dataRef.current.id
        ) {
          setWidgetValue(obj.value as typeof initialValue)
        }
      }

      bridge.on("update-value", listener)

      return () => {
        bridge.off("update-value", listener)
      }
    }, [])

    const setValue: SetWidgetValueAction<typeof initialValue> = (
      value,
      target: EmitTarget = EmitTarget.All
    ) => {
      if (typeof value === "function") {
        setWidgetValue(prev => {
          const newVal = (value as any)(prev)
          emit(newVal, target)
          return newVal
        })
      } else {
        emit(value as WidgetValue, target)
        if (target === EmitTarget.All) setWidgetValue(value)
      }
    }

    return [widgetValue, setValue]
  }

  const widgetProperties = fillWithValues(data.properties, DEF_WIDGET_PROPS)

  // assign all defined properties
  for (const [key, val] of Object.entries(data.properties || {})) {
    if (val !== null && val !== undefined)
      (widgetProperties as Record<string, any>)[key] = val
  }

  const choosenWidgetProps: ChoosenWidgetProps = {
    ...{ ...data, properties: widgetProperties },
    useWidgetValue
  }

  // handle editing

  const { moving, editing } = useEditing()

  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)

  const posPan = useRef(
    new Animated.ValueXY({
      x: left,
      y: top
    })
  ).current

  useEffect(() => {
    posPan.setValue({
      x: left,
      y: top
    })
  }, [top, left])

  const posPanOffset = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0
    })
  ).current

  const posChangeData = useRef({
    panX: 0,
    panY: 0,
    panOffsetX: 0,
    panOffsetY: 0
  }).current

  posPan.x.addListener(({ value }) => (posChangeData.panX = value))
  posPan.y.addListener(({ value }) => (posChangeData.panY = value))
  posPanOffset.x.addListener(({ value }) => (posChangeData.panOffsetX = value))
  posPanOffset.y.addListener(({ value }) => (posChangeData.panOffsetY = value))

  const posPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true)
      },
      onPanResponderMove: Animated.event(
        [null, { dx: posPanOffset.x, dy: posPanOffset.y }],
        {
          useNativeDriver: false
        }
      ),
      onPanResponderRelease: () => {
        onChangePos(
          dataRef.current,
          posChangeData.panX + posChangeData.panOffsetX,
          posChangeData.panY + posChangeData.panOffsetY
        )

        posPanOffset.x.setValue(0)
        posPanOffset.y.setValue(0)
        setDragging(false)
      }
    })
  ).current

  const sizePan = useRef(
    new Animated.ValueXY({
      x: width,
      y: height
    })
  ).current

  useEffect(() => {
    sizePan.setValue({
      x: width,
      y: height
    })
  }, [width, height])

  const sizePanOffset = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0
    })
  ).current

  const sizeChangeData = useRef({
    panW: 0,
    panH: 0,
    panOffsetW: 0,
    panOffsetH: 0
  }).current

  sizePan.x.addListener(({ value }) => (sizeChangeData.panW = value))
  sizePan.y.addListener(({ value }) => (sizeChangeData.panH = value))
  sizePanOffset.x.addListener(
    ({ value }) => (sizeChangeData.panOffsetW = value)
  )
  sizePanOffset.y.addListener(
    ({ value }) => (sizeChangeData.panOffsetH = value)
  )

  const sizePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setResizing(true)
      },
      onPanResponderMove: Animated.event(
        [null, { dx: sizePanOffset.x, dy: sizePanOffset.y }],
        {
          useNativeDriver: false
        }
      ),
      onPanResponderRelease: () => {
        onChangeSize(
          dataRef.current,
          sizeChangeData.panW + sizeChangeData.panOffsetW,
          sizeChangeData.panH + sizeChangeData.panOffsetH
        )

        sizePanOffset.x.setValue(0)
        sizePanOffset.y.setValue(0)
        setResizing(false)
      }
    })
  ).current

  const [editWidgetModalOpen, setEditWidgetModalOpen] = useState(false)

  const handleEdit = (submitData: SubmitData) => {
    const widgetData: WidgetData = {
      ...data,
      deviceId: submitData.deviceId,
      customId: submitData.customId,
      properties: submitData.properties
    }

    onEdit(widgetData)
    setEditWidgetModalOpen(false)
  }

  const handleDelete = () => {
    onDelete(data)
    setEditWidgetModalOpen(false)
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: Animated.add(sizePan.x, sizePanOffset.x),
        height: Animated.add(sizePan.y, sizePanOffset.y),
        top: Animated.add(posPan.y, posPanOffset.y),
        left: Animated.add(posPan.x, posPanOffset.x),
        zIndex: dragging || resizing ? 1 : 0
      }}
    >
      <EditWidgetModal
        widget={data}
        open={editWidgetModalOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={() => setEditWidgetModalOpen(false)}
      />
      <View style={styles.wrapper}>
        {Boolean(widgetProperties.title) && (
          <Text selectable={false} style={styles.title}>
            {widgetProperties.title}
          </Text>
        )}
        <ChoosenWidget {...choosenWidgetProps} />
      </View>
      {editing && (
        <TouchableWithoutFeedback onPress={() => setEditWidgetModalOpen(true)}>
          <View style={[styles.changeCoverBase, styles.editCover]}>
            <List.Icon icon="pencil" color={Colors.amber500} />
          </View>
        </TouchableWithoutFeedback>
      )}
      {moving && (
        <Animated.View
          {...posPanResponder.panHandlers}
          style={[
            styles.changeCoverBase,
            styles.moveCover,
            {
              width: Animated.add(sizePan.x, sizePanOffset.x),
              height: Animated.add(sizePan.y, sizePanOffset.y)
            }
          ]}
        >
          <View
            {...sizePanResponder.panHandlers}
            style={styles.resizeHandle}
          ></View>
        </Animated.View>
      )}
    </Animated.View>
  )
}

export default Widget

const getStyles = (theme: Theme) => {
  const resizeHandleSize = 30

  return StyleSheet.create({
    wrapper: {
      flex: 1,
      padding: 4
    },
    title: {
      textTransform: "uppercase",
      fontSize: 9,
      padding: 5,
      paddingBottom: 0,
      color: Colors.grey500
    },
    changeCoverBase: {
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: theme.colors.background + "99",
      borderWidth: 3,
      borderStyle: "dashed",
      borderRadius: resizeHandleSize / 2
    },
    editCover: {
      borderColor: Colors.amber400,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center"
    },
    moveCover: {
      borderColor: theme.colors.accent
    },
    resizeHandle: {
      position: "absolute",
      bottom: -3,
      right: -3,
      width: resizeHandleSize,
      height: resizeHandleSize,
      backgroundColor: theme.colors.accent,
      borderRadius: resizeHandleSize / 2
    }
  })
}
