import { FullGglDeviceTrait, WidgetValue } from "src/types/types"
import {
  hsvToRGB,
  integerToRGB,
  rgbToInteger,
  temperatureToRGB
} from "src/utils/color"

type ValueGetter = (deviceId: number, customId: string) => Promise<WidgetValue>

async function getValueOfTargetWithName(
  getValue: ValueGetter,
  trait: FullGglDeviceTrait,
  name?: string
) {
  const { customId, deviceId } = trait.targets.find(
    t => t.name === (name ?? trait.name)
  )

  const value = await getValue(deviceId, customId)

  return value
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
  attributes?: Record<string, any>
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
    attributes: { discreteOnlyOpenClose: true },
    targets: ["OpenClose"],
    async valueToGglState(trait, getValue) {
      const value = (await getValueOfTargetWithName(getValue, trait)) ? 100 : 0

      return {
        openPercent: value
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
    attributes: { colorModel: "rgb" },
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
    commands: {
      ColorAbsolute: {
        async commandToValue(params, trait, setValue) {
          let [r, g, b] = [0, 0, 0]

          if (params.color.temperature) {
            const colors = temperatureToRGB(params.color.temperature)
            r = colors.red
            g = colors.green
            b = colors.blue
          } else if (params.color.spectrumRGB) {
            const colors = integerToRGB(params.color.spectrumRGB)
            r = colors.red
            g = colors.green
            b = colors.blue
          } else if (params.color.spectrumHSV) {
            const colors = hsvToRGB(
              params.color.spectrumHSV.hue,
              params.color.spectrumHSV.saturation,
              params.color.spectrumHSV.value
            )

            r = colors.red
            g = colors.green
            b = colors.blue
          }

          await setValueOfTargetWithName(setValue, trait, r, "r")
          await setValueOfTargetWithName(setValue, trait, g, "g")
          await setValueOfTargetWithName(setValue, trait, b, "b")
        }
      }
    }
  },
  TemperatureSetting: {
    attributes: {
      availableThermostatModes: ["heat"],
      thermostatTemperatureRange: {
        minThresholdCelsius: 9,
        maxThresholdCelsius: 30
      },
      thermostatTemperatureUnit: "C"
    },
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
    commands: {
      ThermostatTemperatureSetpoint: {
        async commandToValue(params, trait, setValue) {
          await setValueOfTargetWithName(
            setValue,
            trait,
            params.thermostatTemperatureSetpoint,
            "setpoint"
          )
        }
      }
    }
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
