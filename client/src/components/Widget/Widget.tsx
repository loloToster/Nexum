import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Text, useTheme, Colors } from "react-native-paper"

import { WidgetProperties, WidgetData, WidgetValue } from "src/types"
import { EventEmitter } from "src/utils"

import { useSocket, ValueUpdateFunc, ValueUpdateObj } from "src/contexts/socket"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"

import Button from "./Button/Button"
import SliderWidget from "./Slider/Slider"
import Gauge from "./Gauge/Gauge"
import Label from "./Label/Label"

export type SetWidgetValueAction<T> = {
  (newVal: React.SetStateAction<T>): void
  // onlyServer option is used to prevent infinite loop
  (newVal: React.SetStateAction<T>, onlyServer?: false): void
  (newVal: T, onlyServer?: true): void
}

export type WidgetValueHook = <T = WidgetValue>(
  initialValue: T
) => [T, SetWidgetValueAction<T>]

export interface WidgetProps extends Omit<WidgetData, "properties"> {
  properties: WidgetProperties
  useWidgetValue: WidgetValueHook
}

// maps string type prop to component
const map: Record<
  string,
  ((props: WidgetProps) => JSX.Element) | (() => JSX.Element)
> = {
  btn: Button,
  sldr: SliderWidget,
  gauge: Gauge,
  lbl: Label
}

interface LocalValueUpdateObj extends ValueUpdateObj {
  widgetId: number
}

const localChangeEmitter = new EventEmitter()
const values: Record<number, WidgetValue | undefined> = {}

function Widget(props: WidgetData) {
  const theme = useTheme()
  const styles = getStyles()
  const ChoosenWidget = map[props.type] || Unknown

  const useWidgetValue: WidgetValueHook = initialValue => {
    if (values[props.id] !== undefined)
      initialValue = values[props.id] as typeof initialValue
    else if (props.value !== null && typeof initialValue == typeof props.value)
      initialValue = props.value as typeof initialValue

    const { socket } = useSocket()
    const [widgetValue, setWidgetValue] = useState(initialValue)

    useEffect(() => {
      values[props.id] = widgetValue as WidgetValue
    }, [widgetValue])

    useEffect(() => {
      const listener: ValueUpdateFunc = obj => {
        if (
          obj.target === props.target &&
          typeof obj.value === typeof initialValue
        ) {
          setWidgetValue(obj.value as typeof initialValue)
        }
      }

      const localListener = (obj: LocalValueUpdateObj) => {
        if (obj.widgetId !== props.id) listener(obj)
      }

      localChangeEmitter.on("update-value", localListener)
      socket?.on("update-value", listener)

      return () => {
        localChangeEmitter.off("update-value", localListener)
        socket?.off("update-value", listener)
      }
    }, [])

    const emit = (val: WidgetValue) => {
      values[props.id] = val

      const emitObj = {
        target: props.target,
        value: val
      }

      localChangeEmitter.emit("update-value", {
        widgetId: props.id,
        ...emitObj
      })

      socket?.emit("update-value", emitObj)
    }

    const setValue: SetWidgetValueAction<typeof initialValue> = (
      value,
      onlyServer = false
    ) => {
      if (typeof value === "function") {
        setWidgetValue(prev => {
          // @ts-ignore
          const newVal = value(prev)
          emit(newVal)
          return newVal
        })
      } else {
        emit(value as WidgetValue)
        if (!onlyServer) setWidgetValue(value)
      }
    }

    return [widgetValue, setValue]
  }

  const widgetProperties: WidgetProperties = {
    // default values
    title: "",
    color: theme.colors.accent,
    text: "Text",
    isSwitch: true,
    isVertical: false,
    min: 0,
    max: 10,
    step: 1
  }

  // assign all defined properties
  for (const [key, val] of Object.entries(props.properties || {})) {
    if (val !== null && val !== undefined)
      (widgetProperties as Record<string, any>)[key] = val
  }

  const choosenWidgetProps: WidgetProps = {
    ...{ ...props, properties: widgetProperties },
    useWidgetValue
  }

  return (
    <View style={styles.wrapper}>
      {Boolean(widgetProperties.title) && (
        <Text style={styles.title}>{widgetProperties.title}</Text>
      )}
      <ChoosenWidget {...choosenWidgetProps} />
    </View>
  )
}

export default Widget

const getStyles = () => {
  return StyleSheet.create({
    wrapper: {
      flex: 1
    },
    title: {
      textTransform: "uppercase",
      fontSize: 9,
      padding: 5,
      paddingBottom: 0,
      color: Colors.grey500
    }
  })
}
