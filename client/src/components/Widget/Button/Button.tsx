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
  const isSwitch = true

  const theme = useTheme()
  const styles = getStyles(theme, color)

  const { useWidgetValue } = props
  const [value, setValue] = useWidgetValue(false)

  type PressFunc = ((event: GestureResponderEvent) => void) | undefined

  let pressHandler: PressFunc,
    pressInHandler: PressFunc,
    pressOutHandler: PressFunc

  if (isSwitch) {
    pressHandler = () => setValue(prev => !prev)
  } else {
    pressInHandler = () => setValue(true)
    pressOutHandler = () => setValue(false)
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
