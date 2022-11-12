import { useState } from "react"
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  ColorValue,
  GestureResponderEvent
} from "react-native"
import { Text, useTheme, Theme } from "react-native-paper"

import { WidgetProps } from "../types"

function Button(props: WidgetProps) {
  const color = "teal"
  const text = "Button"
  const isSwitch = false

  const theme = useTheme()
  const styles = getStyles(theme, color)

  const [value, setValue] = useState(false)
  const { setOnChangeHandler, updateValue } = props

  setOnChangeHandler(val => {
    setValue(val as boolean)
  })

  type PressFunc = ((event: GestureResponderEvent) => void) | undefined

  let pressHandler: PressFunc,
    pressInHandler: PressFunc,
    pressOutHandler: PressFunc

  if (isSwitch) {
    pressHandler = () =>
      setValue(prev => {
        const newVal = !prev
        updateValue(newVal)
        return newVal
      })
  } else {
    pressInHandler = () => {
      updateValue(true)
      setValue(true)
    }
    pressOutHandler = () => {
      updateValue(false)
      setValue(false)
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={pressHandler}
      onPressIn={pressInHandler}
      onPressOut={pressOutHandler}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: value ? color : "transparent" }
        ]}
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
