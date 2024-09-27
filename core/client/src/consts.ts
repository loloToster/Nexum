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
