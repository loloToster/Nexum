import { FullGglDeviceTrait, WidgetValue } from "src/types/types"

function rgbToInteger(red: number, green: number, blue: number) {
  red = Math.max(0, Math.min(255, red))
  green = Math.max(0, Math.min(255, green))
  blue = Math.max(0, Math.min(255, blue))

  return (red << 16) | (green << 8) | blue
}

type ValueGetter = (deviceId: number, customId: string) => Promise<WidgetValue>

type ValuesToGglMap = Record<
  string,
  | {
      valueToGglState: (
        trait: FullGglDeviceTrait,
        getValue: ValueGetter
      ) => Promise<Record<string, any>>
    }
  | undefined
>

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

export const valuesToGglMap: ValuesToGglMap = {
  OnOff: {
    async valueToGglState(trait, getValue) {
      const value = await getValueOfTargetWithName(getValue, trait)

      return {
        on: typeof value === "boolean" ? value : true
      }
    }
  },
  OpenClose: {
    async valueToGglState(trait, getValue) {
      const value = (await getValueOfTargetWithName(getValue, trait)) ? 100 : 0

      return {
        on: typeof value === "boolean" ? value : 0
      }
    }
  },
  Brightness: {
    async valueToGglState(trait, getValue) {
      const value = await getValueOfTargetWithName(getValue, trait)

      return {
        brightness: Math.max(
          Math.min(typeof value === "number" ? value : 0, 100),
          0
        )
      }
    }
  },
  ColorSetting: {
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
    }
  },
  TemperatureSetting: {
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
    }
  }
}

type ValueSetter = (
  deviceId: number,
  customId: string,
  val: WidgetValue
) => Promise<void>

type CommandsToValuesMap = Record<
  string,
  | {
      trait: string
      commandToValue: (
        params: Record<string, any>,
        trait: FullGglDeviceTrait,
        setValue: ValueSetter
      ) => Promise<void>
    }
  | undefined
>

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

export const commandsToValuesMap: CommandsToValuesMap = {
  OnOff: {
    trait: "OnOff",
    async commandToValue(params, trait, setValue) {
      await setValueOfTargetWithName(setValue, trait, params.on, "OnOff")
    }
  },
  OpenClose: {
    trait: "OpenClose",
    async commandToValue(params, trait, setValue) {
      await setValueOfTargetWithName(
        setValue,
        trait,
        Boolean(params.openPercent),
        "OpenClose"
      )
    }
  },
  BrightnessAbsolute: {
    trait: "Brightness",
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
