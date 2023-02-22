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
  onChangePos: (widget: WidgetData, x: number, y: number) => any
  onChangeSize: (widget: WidgetData, w: number, h: number) => any
}

function Widget({
  data,
  width,
  height,
  left,
  top,
  onChangePos,
  onChangeSize
}: WidgetProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

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
          data,
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
          data,
          sizeChangeData.panW + sizeChangeData.panOffsetW,
          sizeChangeData.panH + sizeChangeData.panOffsetH
        )

        sizePanOffset.x.setValue(0)
        sizePanOffset.y.setValue(0)
        setResizing(false)
      }
    })
  ).current

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
      <View style={styles.wrapper}>
        {Boolean(widgetProperties.title) && (
          <Text selectable={false} style={styles.title}>
            {widgetProperties.title}
          </Text>
        )}
        <ChoosenWidget {...choosenWidgetProps} />
      </View>
      <Animated.View
        {...posPanResponder.panHandlers}
        style={[
          styles.edit,
          {
            width: Animated.add(sizePan.x, sizePanOffset.x),
            height: Animated.add(sizePan.y, sizePanOffset.y)
          }
        ]}
      >
        <View {...sizePanResponder.panHandlers} style={styles.resize}></View>
      </Animated.View>
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
    edit: {
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: theme.colors.background + "99",
      borderColor: theme.colors.accent,
      borderWidth: 3,
      borderStyle: "dashed",
      borderRadius: resizeHandleSize / 2
    },
    resize: {
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
