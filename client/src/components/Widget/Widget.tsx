import React, { useEffect, useState } from "react"
import { useTheme } from "react-native-paper"

import { WidgetProperties, WidgetData, WidgetValue } from "src/types"
import { EventEmitter } from "src/utils"

import { useSocket, ValueUpdateFunc, ValueUpdateObj } from "src/contexts/socket"

// special component returned if provided type does not match any component in map
import Unknown from "./Unknown/Unknown"

import Button from "./Button/Button"
import SliderWidget from "./Slider/Slider"
import Gauge from "./Gauge/Gauge"

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
const map: Record<string, (props?: WidgetProps) => JSX.Element> = {
  btn: Button,
  sldr: SliderWidget,
  gauge: Gauge
}

interface LocalValueUpdateObj extends ValueUpdateObj {
  widgetId: number
}

const localChangeEmitter = new EventEmitter()

function Widget(props: WidgetData) {
  const theme = useTheme()
  const ChoosenWidget = map[props.type] || Unknown

  const useWidgetValue: WidgetValueHook = initialValue => {
    const { socket } = useSocket()
    const [widgetValue, setWidgetValue] = useState(initialValue)

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
      socket.on("update-value", listener)

      return () => {
        localChangeEmitter.off("update-value", localListener)
        socket.off("update-value", listener)
      }
    }, [])

    const emit = (val: WidgetValue) => {
      const emitObj = {
        target: props.target,
        value: val
      }

      localChangeEmitter.emit("update-value", {
        widgetId: props.id,
        ...emitObj
      })

      socket.emit("update-value", emitObj)
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
