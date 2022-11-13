import { useEffect, useState } from "react"

import {
  SetWidgetValueAction,
  WidgetData,
  WidgetProps,
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

  const choosenWidgetProps: WidgetProps = {
    ...props,
    useWidgetValue
  }

  return <ChoosenWidget {...choosenWidgetProps} />
}

export default Widget
