import React, { useState } from "react"
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions
} from "react-native"
import {
  Button,
  Icon,
  MD2Colors,
  MD2Theme,
  Modal,
  Portal,
  Surface,
  useTheme
} from "react-native-paper"
import ColorPicker, {
  Panel3,
  InputWidget,
  BrightnessSlider
} from "reanimated-color-picker"

import { ChoosenWidgetProps, WidgetComponent } from "../Widget"

interface RGB {
  r: number
  g: number
  b: number
}

function rgbToInteger(clrs: RGB) {
  const red = Math.max(0, Math.min(255, clrs.r))
  const green = Math.max(0, Math.min(255, clrs.g))
  const blue = Math.max(0, Math.min(255, clrs.b))

  return (red << 16) | (green << 8) | blue
}

function integerToRGB(colorInteger: number): RGB {
  const r = (colorInteger >> 16) & 0xff
  const g = (colorInteger >> 8) & 0xff
  const b = colorInteger & 0xff

  return { r, g, b }
}

function rgbToStyle(clrs: RGB) {
  return `rgb(${clrs.r}, ${clrs.g}, ${clrs.b})`
}

function isLight(clrs: RGB) {
  const brightness = 0.299 * clrs.r + 0.587 * clrs.g + 0.114 * clrs.b
  return brightness > 127.5
}

function ColorPickerComponent(props: ChoosenWidgetProps) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const { useWidgetValue } = props
  const [value, setValue] = useWidgetValue(0)

  const [modalOpen, setModalOpen] = useState(false)

  const handlePress = () => {
    setModalOpen(true)
  }

  const valRgbInt = integerToRGB(value)
  const valAsStyle = rgbToStyle(valRgbInt)
  const light = isLight(valRgbInt)
  const onColor = light ? "black" : "white"

  return (
    <View style={styles.wrapper}>
      <Portal>
        <Modal
          visible={modalOpen}
          onDismiss={() => setModalOpen(false)}
          style={styles.modal}
        >
          <Surface style={styles.modalContent}>
            <ColorPicker
              style={styles.picker}
              value={valAsStyle}
              onComplete={res => {
                const matched = res.rgb.match(/\d+/g)
                if (!matched) return
                const [r, g, b] = matched.map(Number)
                setValue(rgbToInteger({ r, g, b }))
              }}
            >
              <Panel3 centerChannel="saturation" />
              <BrightnessSlider style={{ borderRadius: 1000 }} />
              <InputWidget
                defaultFormat="RGB"
                formats={["HEX", "RGB", "HSL"]}
                disableAlphaChannel
                inputStyle={styles.pickerInput}
                iconColor={theme.colors.text}
              />
            </ColorPicker>
            <Button
              style={[styles.okBtn, { backgroundColor: valAsStyle }]}
              labelStyle={{ color: onColor }}
              onPress={() => setModalOpen(false)}
              mode="contained"
            >
              OK
            </Button>
          </Surface>
        </Modal>
      </Portal>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View
          style={[
            styles.btn,
            { backgroundColor: valAsStyle, borderColor: onColor }
          ]}
        >
          <Icon size={32} source="eyedropper-variant" color={onColor} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const ColorPickerWidget: WidgetComponent = {
  component: ColorPickerComponent,
  id: "clr",
  name: "Color Picker",
  editableProperties: [],
  icon: "format-color-fill",
  defaultSize: {
    height: 2,
    width: 2
  }
}

export default ColorPickerWidget

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    wrapper: {
      flex: 1
    },
    btn: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10000,
      margin: 5,
      backgroundColor: "black",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: MD2Colors.grey500
    },
    modal: {
      alignItems: "center",
      justifyContent: "center"
    },
    modalContent: {
      flex: 1,
      alignItems: "center",
      gap: 12,
      width: Dimensions.get("window").width / 1.3,
      padding: 20,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.background
    },
    picker: {
      width: "95%",
      gap: 12
    },
    pickerInput: {
      color: theme.colors.text
    },
    okBtn: {
      width: "70%"
    }
  })
}
