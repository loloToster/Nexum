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
  id: number
  token: string
  name: string
  active?: number
}

export type WidgetValue = string | boolean | number

export interface WidgetProperties {
  title: string
  color: string
  text: string
  onText: string
  offText: string
  isSwitch: boolean
  isVertical: boolean
  min: number
  max: number
  step: number
}

export type WidgetProperty = keyof WidgetProperties
export type WidgetPropertyValue = WidgetProperties[WidgetProperty]

export interface WidgetData {
  id: number
  type: string
  target: string
  value: WidgetValue | null
  x: number
  y: number
  width: number
  height: number
  properties?: Partial<WidgetProperties>
}

export interface Tab {
  id: number
  name: string
}

export interface TabData {
  name: string
  widgets: WidgetData[]
}
