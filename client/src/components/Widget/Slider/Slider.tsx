import { View, StyleSheet } from "react-native"

import Slider from "../../Slider/Slider"

import { WidgetData } from "../types"

function SliderWidget(props: WidgetData) {
  const color = "teal"
  const isVertical = true

  const styles = getStyles()

  return (
    <View style={styles.container}>
      <Slider
        minColor={color}
        thumbColor={color}
        maxColor="#040404"
        vertical={isVertical}
        onChange={console.log}
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
