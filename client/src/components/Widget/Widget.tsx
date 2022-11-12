import { useEffect, useRef } from "react"

import { WidgetData, WidgetProps, WidgetValue, WidgetFunc } from "./types"

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
  const onChangeHandler = useRef<WidgetFunc>(() => {})

  const { socket } = useSocket()

  useEffect(() => {
    const listener: ValueUpdateFunc = obj => {
      if (obj.customId === props.customId) onChangeHandler.current(obj.value)
    }

    socket.on("update-value", listener)
    return () => {
      socket.off("update-value", listener)
    }
  }, [])

  const updateValue = (value: WidgetValue) => {
    socket.emit("update-value", {
      customId: props.customId,
      value
    })
  }

  const choosenWidgetProps: WidgetProps = {
    ...props,
    setOnChangeHandler: (func: WidgetFunc) => {
      onChangeHandler.current = func
    },
    updateValue
  }

  return <ChoosenWidget {...choosenWidgetProps} />
}

export default Widget
