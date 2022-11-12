import { useState } from "react"
import { View, StyleSheet } from "react-native"
import Slider from "../../Slider/Slider"

import { WidgetProps } from "../types"

function SliderWidget(props: WidgetProps) {
  const color = "teal"
  const isVertical = true

  const [value, setValue] = useState(0)
  const styles = getStyles()

  const { setOnChangeHandler, updateValue } = props

  setOnChangeHandler(val => {
    setValue(val as number)
  })

  return (
    <View style={styles.container}>
      <Slider
        initialValue={(value as number) || 0}
        minColor={color}
        thumbColor={color}
        maxColor="#040404"
        vertical={isVertical}
        onChange={updateValue}
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
