import {
  GooglehomeDevice,
  GooglehomeDeviceTrait,
  GooglehomeTraitTarget,
  Tab,
  User,
  Widget
} from "@prisma/client"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export interface UserWithTabs extends User {
  tabs: Tab[]
}

export interface WidgetWithTarget extends Widget {
  target: string
}

export interface TabWithWidgets extends Tab {
  widgets: WidgetWithTarget[]
}

export interface UserWithTabsAndWidgets extends User {
  tabs: TabWithWidgets[]
}

export type WidgetValue = string | boolean | number

export type FullGglDeviceTrait = GooglehomeDeviceTrait & {
  targets: GooglehomeTraitTarget[]
}

export type FullGglDevice = GooglehomeDevice & {
  traits: FullGglDeviceTrait[]
}
