import React, { useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import { Theme, useTheme } from "react-native-paper"

import { ChoosenWidgetProps } from "../Widget"

function NumberInputWidget(props: ChoosenWidgetProps) {
  const { color, min, max } = props.properties

  const theme = useTheme()
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

export default NumberInputWidget

const getStyles = (color: string, theme: Theme) => {
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
