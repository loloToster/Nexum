import React, { useState } from "react"
import { View, StyleSheet, ColorValue } from "react-native"
import { Text, useTheme, Theme } from "react-native-paper"
import { AnimatedCircularProgress } from "react-native-circular-progress"

import { map } from "../../../utils"

import { WidgetProps } from "../types"

function Gauge(props: WidgetProps) {
  const { color, text, min, max, step } = props.properties

  const theme = useTheme()
  const styles = getStyles(theme, color)

  const { useWidgetValue } = props
  const [value] = useWidgetValue(min)

  const [size, setSize] = useState(0)
  // TODO: calc by step
  const roundDigits =
    step % 1 === 0 ? 0 : step.toString().split(".").at(-1).length

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
        fill={map(value, min, max, 0, 100)}
        tintColor={color}
        backgroundColor={"#090909"}
        arcSweepAngle={270}
        rotation={225}
        lineCap="round"
      >
        {() => (
          <Text style={styles.text}>
            {text.replace(/\/val\//, value.toFixed(roundDigits))}
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
