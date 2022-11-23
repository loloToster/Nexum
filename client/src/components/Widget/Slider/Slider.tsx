import React from "react"
import { View, StyleSheet } from "react-native"
import Slider from "src/components/Slider/Slider"

import { WidgetProps } from "../Widget"

function SliderWidget(props: WidgetProps) {
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
        onChange={v => setValue(v, true)}
      />
    </View>
  )
}

export default SliderWidget

const getStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }
  })
}
