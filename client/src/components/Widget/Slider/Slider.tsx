import React from "react"
import { View, StyleSheet } from "react-native"
import Slider from "src/components/Slider/Slider"

import { WidgetProps } from "src/components/Widget/types"

function SliderWidget(props: WidgetProps) {
  const { color, isVertical } = props.properties

  const styles = getStyles()

  const { useWidgetValue } = props
  const [value, setValue] = useWidgetValue(0)

  return (
    <View style={styles.container}>
      <Slider
        initialValue={value}
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
