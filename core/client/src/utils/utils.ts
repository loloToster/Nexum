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
