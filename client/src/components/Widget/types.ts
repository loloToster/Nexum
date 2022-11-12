export interface WidgetData {
  type: string
  customId: string
  x: number
  y: number
  width: number
  height: number
}

export type WidgetValue = string | number | boolean
export type WidgetFunc = (val: WidgetValue) => void

export interface WidgetProps extends WidgetData {
  updateValue: WidgetFunc
  setOnChangeHandler: (func: WidgetFunc) => void
}
