import { Colors } from "react-native-paper"
import type { WidgetProperties } from "./types"
import type { SupportedGooglehomeDevice } from "./types/ggl"

export const SURFACE_COLOR = "#565656"
export const PRIMARY_COLOR = Colors.teal300
export const ACCENT_COLOR = Colors.cyan400

export const DEF_WIDGET_PROPS: WidgetProperties = {
  title: "",
  color: ACCENT_COLOR,
  text: "",
  onText: "",
  offText: "",
  isSwitch: true,
  isVertical: false,
  min: 0,
  max: 10,
  step: 1
}

export const defaultComponentWidth = 3
export const defaultComponentHeight = 2

export const SUP_DEVICES: SupportedGooglehomeDevice[] = [
  {
    type: "LIGHT",
    icon: "lightbulb",
    traits: [
      { name: "OnOff", required: true, targets: ["OnOff"] },
      { name: "Brightness", required: false, targets: ["Brightness"] },
      { name: "ColorSetting", required: false, targets: ["r", "g", "b"] }
    ]
  },
  {
    type: "SWITCH",
    icon: "light-switch",
    traits: [{ name: "OnOff", required: true, targets: ["OnOff"] }]
  },
  {
    type: "GATE",
    icon: "gate",
    traits: [{ name: "OpenClose", required: true, targets: ["OpenClose"] }]
  },
  {
    type: "GARAGE",
    icon: "garage",
    traits: [{ name: "OpenClose", required: true, targets: ["OpenClose"] }]
  },
  {
    type: "THERMOSTAT",
    icon: "thermostat",
    traits: [
      {
        name: "TemperatureSetting",
        required: true,
        targets: ["ambient", "setpoint"]
      }
    ]
  }
]
