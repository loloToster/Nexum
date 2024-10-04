export interface SupportedGooglehomeDevice {
  type: string
  icon: string
  traits: Array<{
    name: string
    required: boolean
    modes: Array<{
      id: string
      label: string
      targets: string[]
    }>
  }>
}

export interface GooglehomeDeviceTarget {
  name: string
  deviceId: number
  customId: string
}

export interface GooglehomeDevice {
  id: number
  type: string
  name: string
  traits: Array<{
    name: string
    mode: string
    targets: GooglehomeDeviceTarget[]
  }>
}
