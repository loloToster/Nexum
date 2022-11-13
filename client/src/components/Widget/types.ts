export interface WidgetData {
  type: string
  customId: string
  x: number
  y: number
  width: number
  height: number
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

export interface WidgetProps extends WidgetData {
  useWidgetValue: WidgetValueHook
}
