import { FullGglDeviceTrait, WidgetValue } from "src/types/types"

function rgbToInteger(red: number, green: number, blue: number) {
  red = Math.max(0, Math.min(255, red))
  green = Math.max(0, Math.min(255, green))
  blue = Math.max(0, Math.min(255, blue))

  return (red << 16) | (green << 8) | blue
}

type ValueGetter = (deviceId: number, customId: string) => Promise<WidgetValue>

async function getValueOfTargetWithName(
  getValue: ValueGetter,
  trait: FullGglDeviceTrait,
  name?: string
) {
  const { customId, deviceId } = trait.targets.find(
    t => t.name === (name ?? trait.name)
  )
  return await getValue(deviceId, customId)
}

type ValueSetter = (
  deviceId: number,
  customId: string,
  val: WidgetValue
) => Promise<void>

async function setValueOfTargetWithName(
  setValue: ValueSetter,
  trait: FullGglDeviceTrait,
  value: WidgetValue,
  name?: string
) {
  const { customId, deviceId } = trait.targets.find(
    t => t.name === (name ?? trait.name)
  )

  await setValue(deviceId, customId, value)
}

export type CmdToVal = (
  params: Record<string, any>,
  trait: FullGglDeviceTrait,
  setValue: ValueSetter
) => Promise<void>

export interface TraitCommand {
  commandToValue: CmdToVal
}

export interface SupportedTrait {
  targets: string[]
  valueToGglState: (
    trait: FullGglDeviceTrait,
    getValue: ValueGetter
  ) => Promise<Record<string, any>>
  commands: Record<string, TraitCommand | undefined>
}

export type SupportedTraits = Record<string, SupportedTrait | undefined>

export const supportedTraits: SupportedTraits = {
  OnOff: {
    targets: ["OnOff"],
    async valueToGglState(trait, getValue) {
      const value = await getValueOfTargetWithName(getValue, trait)

      return {
        on: typeof value === "boolean" ? value : true
      }
    },
    commands: {
      OnOff: {
        async commandToValue(params, trait, setValue) {
          await setValueOfTargetWithName(setValue, trait, params.on, "OnOff")
        }
      }
    }
  },
  OpenClose: {
    targets: ["OpenClose"],
    async valueToGglState(trait, getValue) {
      const value = (await getValueOfTargetWithName(getValue, trait)) ? 100 : 0

      return {
        on: typeof value === "boolean" ? value : 0
      }
    },
    commands: {
      OpenClose: {
        async commandToValue(params, trait, setValue) {
          await setValueOfTargetWithName(
            setValue,
            trait,
            Boolean(params.openPercent),
            "OpenClose"
          )
        }
      }
    }
  },
  Brightness: {
    targets: ["Brightness"],
    async valueToGglState(trait, getValue) {
      const value = await getValueOfTargetWithName(getValue, trait)

      return {
        brightness: Math.max(
          Math.min(typeof value === "number" ? value : 0, 100),
          0
        )
      }
    },
    commands: {
      BrightnessAbsolute: {
        async commandToValue(params, trait, setValue) {
          await setValueOfTargetWithName(
            setValue,
            trait,
            params.brightness,
            "Brightness"
          )
        }
      }
    }
  },
  ColorSetting: {
    targets: ["r", "g", "b"],
    async valueToGglState(trait, getValue) {
      const rValue = await getValueOfTargetWithName(getValue, trait, "r")
      const gValue = await getValueOfTargetWithName(getValue, trait, "g")
      const bValue = await getValueOfTargetWithName(getValue, trait, "b")

      return {
        color: {
          spectrumRgb: rgbToInteger(
            parseInt(rValue.toString()),
            parseInt(gValue.toString()),
            parseInt(bValue.toString())
          )
        }
      }
    },
    commands: {}
  },
  TemperatureSetting: {
    targets: ["ambient", "setpoint"],
    async valueToGglState(trait, getValue) {
      const ambientValue = await getValueOfTargetWithName(
        getValue,
        trait,
        "ambient"
      )

      const setpointValue = await getValueOfTargetWithName(
        getValue,
        trait,
        "setpoint"
      )

      return {
        thermostatMode: "heat",
        activeThermostatMode: "heat",
        thermostatTemperatureAmbient: ambientValue,
        thermostatTemperatureSetpoint: setpointValue
      }
    },
    commands: {}
  }
}

export interface SupportedGooglehomeDevice {
  type: string
  icon: string
  // boolean indicates whether the trait is required
  traits: Record<string, boolean | undefined>
}

export const supportedDevices: SupportedGooglehomeDevice[] = [
  {
    type: "LIGHT",
    icon: "lightbulb",
    traits: {
      OnOff: true,
      Brightness: false,
      ColorSetting: false
    }
  },
  {
    type: "SWITCH",
    icon: "light-switch",
    traits: { OnOff: true }
  },
  {
    type: "GATE",
    icon: "gate",
    traits: { OpenClose: true }
  },
  {
    type: "GARAGE",
    icon: "garage",
    traits: { OpenClose: true }
  },
  {
    type: "THERMOSTAT",
    icon: "thermostat",
    traits: { TemperatureSetting: true }
  }
]
