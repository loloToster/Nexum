import React, { useState } from "react"
import { View, StyleSheet, ColorValue } from "react-native"
import { Text, useTheme, MD2Theme } from "react-native-paper"
import { AnimatedCircularProgress } from "react-native-circular-progress"

import { map, roundBadFloat, roundByStep } from "src/utils"

import { ChoosenWidgetProps, WidgetComponent } from "../Widget"

function GaugeComponent(props: ChoosenWidgetProps) {
  const { color, text, min, max, step } = props.properties

  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme, color)

  const { useWidgetValue } = props
  const [value] = useWidgetValue(min)

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
        fill={map(value, min, max, 0, 100)}
        tintColor={color}
        backgroundColor={"#090909"}
        arcSweepAngle={270}
        rotation={225}
        lineCap="round"
      >
        {() => (
          <Text style={styles.text}>
            {text.replace(
              /\/val\//,
              roundBadFloat(roundByStep(value, step)).toString()
            )}
          </Text>
        )}
      </AnimatedCircularProgress>
    </View>
  )
}

const Gauge: WidgetComponent = {
  component: GaugeComponent,
  id: "gauge",
  name: "Gauge",
  editableProperties: ["color", "step", "text"],
  icon: "gauge-low",
  defaultSize: {
    height: 3,
    width: 4
  }
}

export default Gauge

const getStyles = (theme: MD2Theme, color: ColorValue) => {
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
