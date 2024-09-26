export function map(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * https://stackoverflow.com/a/3644302/15331983
 */
export function roundBadFloat(n: number) {
  return +n.toPrecision(12)
}

/**
 * rounds given number to the closest number that is divisible by step
 * @param n number to round
 * @param step
 * @returns rounded number
 */
export function roundByStep(n: number, step: number) {
  return n - (n % step) + (n % step > step / 2 ? step : 0)
}

export function fillWithValues<T extends Record<string, any>>(
  target: T | Partial<T> | undefined | null,
  values: T
) {
  values = { ...values }

  for (const [key, val] of Object.entries(target || {})) {
    if (val !== null && val !== undefined)
      (values as Record<string, any>)[key] = val
  }

  return values
}

let negativeId = -1

export function getTempNegativeId() {
  return --negativeId
}

// ! keep in sync with backend
export function createTarget(deviceId: number | string, customId: string) {
  return `${deviceId}-${customId}`
}

export function capitalizeFirstLetter(str: string) {
  str = str.toLowerCase()
  return str.charAt(0).toUpperCase() + str.slice(1)
}
