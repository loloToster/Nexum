export function keepBetween(val: unknown, from: number, to: number) {
  return Math.max(Math.min(typeof val === "number" ? val : from, to), 0)
}
