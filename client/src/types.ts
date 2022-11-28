export interface BaseUser {
  id: string
  name: string
  isAdmin: boolean
}

export interface User extends BaseUser {
  tabs: Array<{
    id: number
    name: string
  }>
}

export interface Device {
  id: string
  name: string
}

export type WidgetValue = string | boolean | number

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
  id: number
  type: string
  target: string
  x: number
  y: number
  width: number
  height: number
  properties?: Partial<WidgetProperties>
}

export interface TabData {
  name: string
  widgets: WidgetData[]
}
