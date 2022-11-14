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
