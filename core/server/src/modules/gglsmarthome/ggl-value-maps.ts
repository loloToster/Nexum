import { FullGglDeviceTrait, WidgetValue } from "src/types/types"
import { keepBetween } from "src/utils/numeric"
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
  traitTargetName: string
) {
  const { customId, deviceId } = trait.targets.find(
    t => t.name === traitTargetName
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
  getValue: ValueGetter,
  setValue: ValueSetter
) => Promise<void>

export interface TraitCommand {
  commandToValue: CmdToVal
}

export interface SupportedTraitMode {
  id: string
  label: string
  attributes?: Record<string, any>
  targets: string[]
  valueToGglState?:
    | null
    | ((
        trait: FullGglDeviceTrait,
        getValue: ValueGetter
      ) => Promise<Record<string, any>>)
  commands: Record<string, TraitCommand | undefined>
}

export type SupportedTraits = Record<string, SupportedTraitMode[] | undefined>

export const supportedTraits: SupportedTraits = {
  OnOff: [
    {
      id: "switch",
      label: "Switch",
      targets: ["OnOff"],
      async valueToGglState(trait, getValue) {
        const value = await getValueOfTargetWithName(getValue, trait, "OnOff")

        return {
          on: typeof value === "boolean" ? value : true
        }
      },
      commands: {
        OnOff: {
          async commandToValue(params, trait, _, setValue) {
            await setValueOfTargetWithName(setValue, trait, params.on, "OnOff")
          }
        }
      }
    },
    {
      id: "pulse",
      label: "Pulse",
      attributes: { commandOnlyOnOff: true },
      targets: ["OnOff"],
      commands: {
        OnOff: {
          async commandToValue(params, trait, _, setValue) {
            if (params.on) {
              await setValueOfTargetWithName(setValue, trait, true, "OnOff")
              await new Promise(r => setTimeout(r, 1000))
              await setValueOfTargetWithName(setValue, trait, false, "OnOff")
            } else {
              await setValueOfTargetWithName(setValue, trait, false, "OnOff")
            }
          }
        }
      }
    }
  ],
  OpenClose: [
    {
      id: "switch",
      label: "Switch",
      attributes: { discreteOnlyOpenClose: true },
      targets: ["OpenClose"],
      async valueToGglState(trait, getValue) {
        const value = (await getValueOfTargetWithName(
          getValue,
          trait,
          "OpenClose"
        ))
          ? 100
          : 0

        return {
          openPercent: value
        }
      },
      commands: {
        OpenClose: {
          async commandToValue(params, trait, _, setValue) {
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
    {
      id: "pulse",
      label: "Pulse",
      attributes: { discreteOnlyOpenClose: true, commandOnlyOpenClose: true },
      targets: ["OpenClose"],
      commands: {
        OpenClose: {
          async commandToValue(params, trait, _, setValue) {
            if (params.openPercent) {
              await setValueOfTargetWithName(setValue, trait, true, "OpenClose")
              await new Promise(r => setTimeout(r, 1000))
              await setValueOfTargetWithName(
                setValue,
                trait,
                false,
                "OpenClose"
              )
            } else {
              await setValueOfTargetWithName(
                setValue,
                trait,
                false,
                "OpenClose"
              )
            }
          }
        }
      }
    },
    {
      id: "progressive",
      label: "Progressive",
      targets: ["OpenClose"],
      async valueToGglState(trait, getValue) {
        const value = await getValueOfTargetWithName(
          getValue,
          trait,
          "OpenClose"
        )

        return {
          openPercent: keepBetween(value, 0, 100)
        }
      },
      commands: {
        OpenClose: {
          async commandToValue(params, trait, _, setValue) {
            await setValueOfTargetWithName(
              setValue,
              trait,
              params.openPercent,
              "OpenClose"
            )
          }
        },
        OpenCloseRelative: {
          async commandToValue(params, trait, getValue, setValue) {
            let value = await getValueOfTargetWithName(
              getValue,
              trait,
              "OpenClose"
            )

            value = keepBetween(value + params.openRelativePercent, 0, 100)

            await setValueOfTargetWithName(setValue, trait, value, "OpenClose")
          }
        }
      }
    }
  ],
  Brightness: [
    {
      id: "",
      label: "",
      targets: ["Brightness"],
      async valueToGglState(trait, getValue) {
        const value = await getValueOfTargetWithName(
          getValue,
          trait,
          "Brightness"
        )

        return {
          brightness: keepBetween(value, 0, 100)
        }
      },
      commands: {
        BrightnessAbsolute: {
          async commandToValue(params, trait, _, setValue) {
            await setValueOfTargetWithName(
              setValue,
              trait,
              params.brightness,
              "Brightness"
            )
          }
        },
        BrightnessRelative: {
          async commandToValue(params, trait, getValue, setValue) {
            let value = await getValueOfTargetWithName(
              getValue,
              trait,
              "Brightness"
            )

            value = keepBetween(
              value + params.brightnessRelativePercent,
              0,
              100
            )

            await setValueOfTargetWithName(setValue, trait, value, "Brightness")
          }
        }
      }
    }
  ],
  ColorSetting: [
    {
      id: "3-sliders",
      label: "3 Sliders (R, G, B)",
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
          async commandToValue(params, trait, _, setValue) {
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
    {
      id: "digit-rgb",
      label: "Digit RGB",
      attributes: { colorModel: "rgb" },
      targets: ["ColorSetting"],
      async valueToGglState(trait, getValue) {
        const colorValue = await getValueOfTargetWithName(
          getValue,
          trait,
          "ColorSetting"
        )

        return { color: { spectrumRgb: colorValue } }
      },
      commands: {
        ColorAbsolute: {
          async commandToValue(params, trait, _, setValue) {
            let color: number

            if (params.color.temperature) {
              const { red, green, blue } = temperatureToRGB(
                params.color.temperature
              )

              color = rgbToInteger(red, green, blue)
            } else if (params.color.spectrumRGB) {
              color = params.color.spectrumRGB
            } else if (params.color.spectrumHSV) {
              const { red, green, blue } = hsvToRGB(
                params.color.spectrumHSV.hue,
                params.color.spectrumHSV.saturation,
                params.color.spectrumHSV.value
              )

              color = rgbToInteger(red, green, blue)
            }

            await setValueOfTargetWithName(setValue, trait, color)
          }
        }
      }
    }
  ],
  TemperatureSetting: [
    {
      id: "",
      label: "",
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
          async commandToValue(params, trait, _, setValue) {
            await setValueOfTargetWithName(
              setValue,
              trait,
              params.thermostatTemperatureSetpoint,
              "setpoint"
            )
          }
        },
        TemperatureRelative: {
          async commandToValue(params, trait, getValue, setValue) {
            let value = await getValueOfTargetWithName(
              getValue,
              trait,
              "setpoint"
            )

            value =
              parseFloat(value.toString()) +
              params.thermostatTemperatureRelativeDegree

            await setValueOfTargetWithName(setValue, trait, value, "setpoint")
          }
        }
      }
    }
  ]
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
    type: "OUTLET",
    icon: "power-socket-eu",
    traits: { OnOff: true }
  },
  {
    type: "THERMOSTAT",
    icon: "thermostat",
    traits: { TemperatureSetting: true }
  },
  {
    type: "DOOR",
    icon: "door",
    traits: { OpenClose: true }
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
    type: "BLINDS",
    icon: "blinds",
    traits: { OpenClose: true }
  },
  {
    type: "CURTAIN",
    icon: "curtains",
    traits: { OpenClose: true }
  },
  {
    type: "FAN",
    icon: "fan",
    traits: { OpenClose: true } // todo: add fan speed
  },
  {
    type: "DRAWER",
    icon: "file-cabinet",
    traits: { OpenClose: true }
  }
]
