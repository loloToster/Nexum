import React, { useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import { MD2Theme, useTheme } from "react-native-paper"

import { ChoosenWidgetProps, WidgetComponent } from "../Widget"

function NumberInputWidgetComponent(props: ChoosenWidgetProps) {
  const { color, min, max } = props.properties

  const theme = useTheme<MD2Theme>()
  const styles = getStyles(color, theme)

  const [width, setWidth] = useState(0)

  const { useWidgetValue } = props
  const [value, setValue] = useWidgetValue(0)

  const handleChange = (text: string) => {
    let parsed = parseInt(text)

    if (isNaN(parsed)) parsed = 0

    if (parsed < min) parsed = min
    if (parsed > max) parsed = max

    if (parsed != value) setValue(parsed)
  }

  return (
    <View
      style={styles.container}
      onLayout={({
        nativeEvent: {
          layout: { width }
        }
      }) => setWidth(width)}
    >
      <TextInput
        allowFontScaling={false}
        style={[styles.input, { width }]}
        onChangeText={handleChange}
        value={value?.toString() || "0"}
        keyboardType="numeric"
      />
    </View>
  )
}

const NumberInputWidget: WidgetComponent = {
  component: NumberInputWidgetComponent,
  id: "num",
  name: "Number Input",
  editableProperties: ["color", "min", "max", "step"],
  icon: "sort-numeric-variant",
  defaultSize: {
    height: 1,
    width: 3
  }
}

export default NumberInputWidget

const getStyles = (color: string, theme: MD2Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    input: {
      flex: 1,
      color: "white",
      borderColor: color,
      borderWidth: 3,
      borderRadius: theme.roundness,
      fontSize: 20,
      paddingHorizontal: 8,
      outlineStyle: "none"
    }
  })
}
