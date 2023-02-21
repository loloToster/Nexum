import React, { useEffect, useRef, useState } from "react"
import { View, StyleSheet, PanResponder, Animated } from "react-native"
import { Text, useTheme, Colors, Theme } from "react-native-paper"

import { WidgetProperties, WidgetData, WidgetValue } from "src/types"

import {
  EmitTarget,
  LocalValueUpdateObj,
  useValueBridge
} from "src/contexts/valueBridge"

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

// maps string type prop to component
const map: Record<
  string,
  ((props: ChoosenWidgetProps) => JSX.Element) | (() => JSX.Element)
> = {
  btn: Button,
  sldr: SliderWidget,
  gauge: Gauge,
  lbl: Label,
  number: NumberInput
}

export interface WidgetProps {
  data: WidgetData
  width: number
  height: number
  left: number
  top: number
  onDragEnd: (widget: WidgetData, x: number, y: number) => any
}

function Widget({ data, width, height, left, top, onDragEnd }: WidgetProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [dragging, setDragging] = useState(false)

  const ChoosenWidget = map[data.type] || Unknown

  const useWidgetValue: WidgetValueHook = initialValue => {
    const { bridge, values, emit: rawEmit } = useValueBridge()
    const emit = (val: WidgetValue, target: EmitTarget) =>
      rawEmit(data, val, target)

    if (values[data.target] !== undefined)
      initialValue = values[data.target] as typeof initialValue
    else if (data.value !== null && typeof initialValue == typeof data.value)
      initialValue = data.value as typeof initialValue

    const [widgetValue, setWidgetValue] = useState(initialValue)

    useEffect(() => {
      const listener = (obj: LocalValueUpdateObj) => {
        if (
          obj.target === data.target &&
          typeof obj.value === typeof initialValue &&
          obj.widgetId !== data.id
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

  const widgetProperties: WidgetProperties = {
    // default values
    title: "",
    color: theme.colors.accent,
    text: "",
    onText: "",
    offText: "",
    isSwitch: true,
    isVertical: false,
    min: 0,
    max: 10,
    step: 1
  }

  // assign all defined properties
  for (const [key, val] of Object.entries(data.properties || {})) {
    if (val !== null && val !== undefined)
      (widgetProperties as Record<string, any>)[key] = val
  }

  const choosenWidgetProps: ChoosenWidgetProps = {
    ...{ ...data, properties: widgetProperties },
    useWidgetValue
  }

  const pan = useRef(
    new Animated.ValueXY({
      x: left,
      y: top
    })
  ).current

  useEffect(() => {
    pan.setValue({
      x: left,
      y: top
    })
  }, [top, left])

  const panOffset = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0
    })
  ).current

  const dragEndData = useRef({
    panX: 0,
    panY: 0,
    panOffsetX: 0,
    panOffsetY: 0
  }).current

  pan.x.addListener(({ value }) => (dragEndData.panX = value))
  pan.y.addListener(({ value }) => (dragEndData.panY = value))
  panOffset.x.addListener(({ value }) => (dragEndData.panOffsetX = value))
  panOffset.y.addListener(({ value }) => (dragEndData.panOffsetY = value))

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true)
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panOffset.x, dy: panOffset.y }],
        {
          useNativeDriver: false
        }
      ),
      onPanResponderRelease: () => {
        onDragEnd(
          data,
          dragEndData.panX + dragEndData.panOffsetX,
          dragEndData.panY + dragEndData.panOffsetY
        )

        panOffset.x.setValue(0)
        panOffset.y.setValue(0)
        setDragging(false)
      }
    })
  ).current

  return (
    <Animated.View
      style={{
        position: "absolute",
        width,
        height,
        top: Animated.add(pan.y, panOffset.y),
        left: Animated.add(pan.x, panOffset.x),
        zIndex: dragging ? 1 : 0
      }}
    >
      <View style={styles.wrapper}>
        {Boolean(widgetProperties.title) && (
          <Text selectable={false} style={styles.title}>
            {widgetProperties.title}
          </Text>
        )}
        <ChoosenWidget {...choosenWidgetProps} />
      </View>
      <View
        {...panResponder.panHandlers}
        style={[styles.edit, { width, height }]}
      ></View>
    </Animated.View>
  )
}

export default Widget

const getStyles = (theme: Theme) => {
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
    edit: {
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: theme.colors.background + "99",
      borderColor: theme.colors.accent,
      borderWidth: 3,
      borderStyle: "dashed",
      borderRadius: 10
    }
  })
}
