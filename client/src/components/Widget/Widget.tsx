import React, { useEffect, useState } from "react"
import { useTheme } from "react-native-paper"

import {
  WidgetProperties,
  WidgetData,
  WidgetProps,
  SetWidgetValueAction,
  WidgetValueHook
} from "./types"

import { useSocket, ValueUpdateFunc } from "../../contexts/socket"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"

import Button from "./Button/Button"
import SliderWidget from "./Slider/Slider"
import Gauge from "./Gauge/Gauge"

// maps string type prop to component
const map: Record<string, (props?: WidgetProps) => JSX.Element> = {
  btn: Button,
  sldr: SliderWidget,
  gauge: Gauge
}

function Widget(props: WidgetData) {
  const theme = useTheme()
  const ChoosenWidget = map[props.type] || Unknown

  const useWidgetValue: WidgetValueHook = initialValue => {
    const { socket } = useSocket()
    const [widgetValue, setWidgetValue] = useState(initialValue)

    useEffect(() => {
      const listener: ValueUpdateFunc = obj => {
        if (
          obj.customId === props.customId &&
          typeof obj.value === typeof initialValue
        )
          setWidgetValue(obj.value as typeof initialValue)
      }

      socket.on("update-value", listener)
      return () => {
        socket.off("update-value", listener)
      }
    }, [])

    const emit = val => {
      socket.emit("update-value", {
        customId: props.customId,
        value: val
      })
    }

    const setValue: SetWidgetValueAction<typeof initialValue> = (
      value,
      onlyServer = false
    ) => {
      if (typeof value === "function") {
        setWidgetValue(prev => {
          const newVal = value(prev)
          emit(newVal)
          return newVal
        })
      } else {
        emit(value)
        if (!onlyServer) setWidgetValue(value)
      }
    }

    return [widgetValue, setValue]
  }

  const defaultProperties: WidgetProperties = {
    color: theme.colors.accent,
    text: "Text",
    isSwitch: true,
    isVertical: false,
    min: 0,
    max: 10,
    step: 1
  }

  // asign default properties to undefined or null fields
  const newProperties = props.properties || {}
  Object.keys(defaultProperties).forEach(p => {
    const val = newProperties[p]
    if (val === null || val === undefined)
      newProperties[p] = defaultProperties[p]
  })

  const choosenWidgetProps: WidgetProps = {
    ...{ ...props, properties: newProperties as WidgetProperties },
    useWidgetValue
  }

  return <ChoosenWidget {...choosenWidgetProps} />
}

export default Widget
