import React from "react"
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  ColorValue,
  GestureResponderEvent
} from "react-native"
import { Text, useTheme } from "react-native-paper"

import { ChoosenWidgetProps, WidgetComponent } from "../Widget"

function ButtonComponent(props: ChoosenWidgetProps) {
  const { color, text, onText, offText, isSwitch } = props.properties

  const theme = useTheme()
  const styles = getStyles(color)

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

  let renderedText = value ? onText : offText
  renderedText = renderedText || text

  return (
    <TouchableWithoutFeedback onPress={pressHandler}>
      <View
        onTouchStart={pressInHandler}
        onTouchEnd={pressOutHandler}
        style={[
          styles.container,
          {
            backgroundColor: value ? color : "transparent",
            borderRadius: props.height === 2 ? 1000 : theme.roundness
          }
        ]}
      >
        <Text selectable={false} style={styles.text}>
          {renderedText}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const Button: WidgetComponent = {
  component: ButtonComponent,
  id: "btn",
  name: "Button",
  editableProperties: ["color", "isSwitch", "onText", "offText"],
  icon: "gesture-tap-button"
}

export default Button

const getStyles = (color: ColorValue) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderColor: color,
      borderWidth: 3,
      margin: 5
    },
    text: {
      fontSize: 20
    }
  })
}
