import { useState } from "react"
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  ColorValue,
  GestureResponderEvent
} from "react-native"
import { Text, useTheme, Theme } from "react-native-paper"

import { WidgetData } from "../types"

function Button(props: WidgetData) {
  const color = "teal"
  const text = "Button"
  const isSwitch = false

  const theme = useTheme()
  const styles = getStyles(theme, color)

  const [active, setActive] = useState(false)

  type PressFunc = ((event: GestureResponderEvent) => void) | undefined

  let pressHandler: PressFunc,
    pressInHandler: PressFunc,
    pressOutHandler: PressFunc

  if (isSwitch) {
    pressHandler = () => setActive(prev => !prev)
  } else {
    pressInHandler = () => setActive(true)
    pressOutHandler = () => setActive(false)
  }

  return (
    <TouchableWithoutFeedback
      onPress={pressHandler}
      onPressIn={pressInHandler}
      onPressOut={pressOutHandler}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: active ? color : "transparent"
        }}
      >
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Button

const getStyles = (theme: Theme, color: ColorValue) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderColor: color,
      borderWidth: 3,
      margin: 5,
      borderRadius: theme.roundness
    },
    text: {
      fontSize: 20
    }
  })
}
