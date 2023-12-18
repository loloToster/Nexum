import React from "react"
import { View, StyleSheet, ColorValue } from "react-native"
import { Text } from "react-native-paper"

import { roundBadFloat, roundByStep } from "src/utils"

import { ChoosenWidgetProps, WidgetComponent } from "../Widget"

function LabelComponent(props: ChoosenWidgetProps) {
  let { color, text, step } = props.properties

  text = text || "/val/"

  const styles = getStyles(color)

  const { useWidgetValue } = props
  const [value] = useWidgetValue(0)

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize: props.width === 1 ? 16 : 26 }]}>
        {text.replace(
          /\/val\//,
          roundBadFloat(roundByStep(value, step)).toString()
        )}
      </Text>
    </View>
  )
}

const Label: WidgetComponent = {
  component: LabelComponent,
  id: "lbl",
  name: "Label",
  icon: "label"
}

export default Label

const getStyles = (color: ColorValue) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    text: { color }
  })
}
