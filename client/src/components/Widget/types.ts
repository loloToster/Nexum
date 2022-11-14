export interface WidgetProperties {
  color: string
  text: string
  isSwitch: boolean
  isVertical: boolean
  min: number
  max: number
  step: number
}

export interface WidgetData {
  type: string
  customId: string
  x: number
  y: number
  width: number
  height: number
  properties?: Partial<WidgetProperties>
}

export type SetWidgetValueAction<T> = {
  (newVal: React.SetStateAction<T>): void
  // onlyServer option is used to prevent infinite loop
  (newVal: React.SetStateAction<T>, onlyServer?: false): void
  (newVal: T, onlyServer?: true): void
}

export type WidgetValueHook = <T = string | number | boolean>(
  initialValue: T
) => [T, SetWidgetValueAction<T>]

export interface WidgetProps extends Omit<WidgetData, "properties"> {
  properties: WidgetProperties
  useWidgetValue: WidgetValueHook
}
