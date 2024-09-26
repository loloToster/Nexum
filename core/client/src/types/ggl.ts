export interface SupportedGooglehomeDevice {
  type: string
  icon: string
  traits: Array<{
    name: string
    required: boolean
    targets: string[]
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
    targets: GooglehomeDeviceTarget[]
  }>
}
