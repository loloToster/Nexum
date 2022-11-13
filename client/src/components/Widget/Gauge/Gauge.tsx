import { useState } from "react"
import { View, StyleSheet, ColorValue } from "react-native"
import { Text, useTheme, Theme } from "react-native-paper"

import { AnimatedCircularProgress } from "react-native-circular-progress"

import { WidgetProps } from "../types"

function map(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

function Gauge(props: WidgetProps) {
  const color = "crimson"
  const beforeValue = ""
  const afterValue = "°C"
  const numberRound = 1
  const minValue = 9
  const maxValue = 32

  const { useWidgetValue } = props
  const [value] = useWidgetValue(minValue)

  const theme = useTheme()
  const styles = getStyles(theme, color)

  const [size, setSize] = useState(0)

  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent: { layout } }) =>
        setSize(Math.min(layout.width, layout.height))
      }
    >
      <AnimatedCircularProgress
        size={size}
        width={20}
        fill={map(value, minValue, maxValue, 0, 100)}
        tintColor={color}
        backgroundColor={"#090909"}
        arcSweepAngle={270}
        rotation={225}
        lineCap="round"
      >
        {() => (
          <Text style={styles.text}>
            {`${beforeValue}${+value.toFixed(numberRound)}${afterValue}`}
          </Text>
        )}
      </AnimatedCircularProgress>
    </View>
  )
}

export default Gauge

const getStyles = (theme: Theme, color: ColorValue) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      margin: 10,
      borderRadius: theme.roundness
    },
    text: {
      fontSize: 35,
      color: color
    }
  })
}
