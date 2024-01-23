import React from "react"
import { View, StyleSheet, Platform } from "react-native"
import Slider from "src/components/Slider/Slider"

import { EmitTarget, ChoosenWidgetProps, WidgetComponent } from "../Widget"

function SliderWidgetComponent(props: ChoosenWidgetProps) {
  const { color, isVertical, min, max, step } = props.properties

  const styles = getStyles()

  const { useWidgetValue } = props
  const [value, setValue] = useWidgetValue(0)

  return (
    <View style={styles.container}>
      <Slider
        initialValue={value}
        min={min}
        max={max}
        step={step}
        minColor={color}
        thumbColor={color}
        maxColor="#040404"
        vertical={isVertical}
        onChange={v => setValue(v, EmitTarget.Local)}
        onTouchEnd={v => setValue(v, EmitTarget.ServerAndLocal)}
      />
    </View>
  )
}

const SliderWidget: WidgetComponent = {
  component: SliderWidgetComponent,
  id: "sldr",
  name: "Slider",
  editableProperties: ["color", "isVertical", "min", "max", "step"],
  icon: "arrow-left-right",
  defaultSize: {
    height: 1,
    width: 6
  }
}

export default SliderWidget

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: Platform.OS === "web" ? 5 : 0
    }
  })
}
