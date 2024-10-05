import { keepBetween } from "./numeric"

export function rgbToInteger(red: number, green: number, blue: number) {
  red = Math.max(0, Math.min(255, red))
  green = Math.max(0, Math.min(255, green))
  blue = Math.max(0, Math.min(255, blue))

  return (red << 16) | (green << 8) | blue
}

export function integerToRGB(colorInteger: number) {
  const red = (colorInteger >> 16) & 0xff
  const green = (colorInteger >> 8) & 0xff
  const blue = colorInteger & 0xff

  return { red, green, blue }
}

const tempsToHex = {
  1000: "ff3800",
  1100: "ff4700",
  1200: "ff5300",
  1300: "ff5d00",
  1400: "ff6500",
  1500: "ff6d00",
  1600: "ff7300",
  1700: "ff7900",
  1800: "ff7e00",
  1900: "ff8300",
  2000: "ff8a12",
  2100: "ff8e21",
  2200: "ff932c",
  2300: "ff9836",
  2400: "ff9d3f",
  2500: "ffa148",
  2600: "ffa54f",
  2700: "ffa957",
  2800: "ffad5e",
  2900: "ffb165",
  3000: "ffb46b",
  3100: "ffb872",
  3200: "ffbb78",
  3300: "ffbe7e",
  3400: "ffc184",
  3500: "ffc489",
  3600: "ffc78f",
  3700: "ffc994",
  3800: "ffcc99",
  3900: "ffce9f",
  4000: "ffd1a3",
  4100: "ffd3a8",
  4200: "ffd5ad",
  4300: "ffd7b1",
  4400: "ffd9b6",
  4500: "ffdbba",
  4600: "ffddbe",
  4700: "ffdfc2",
  4800: "ffe1c6",
  4900: "ffe3ca",
  5000: "ffe4ce",
  5100: "ffe6d2",
  5200: "ffe8d5",
  5300: "ffe9d9",
  5400: "ffebdc",
  5500: "ffece0",
  5600: "ffeee3",
  5700: "ffefe6",
  5800: "fff0e9",
  5900: "fff2ec",
  6000: "fff3ef",
  6100: "fff4f2",
  6200: "fff5f5",
  6300: "fff6f7",
  6400: "fff8fb",
  6500: "fff9fd",
  6600: "fef9ff",
  6700: "fcf7ff",
  6800: "f9f6ff",
  6900: "f7f5ff",
  7000: "f5f3ff",
  7100: "f3f2ff",
  7200: "f0f1ff",
  7300: "eff0ff",
  7400: "edefff",
  7500: "ebeeff",
  7600: "e9edff",
  7700: "e7ecff",
  7800: "e6ebff",
  7900: "e4eaff",
  8000: "e3e9ff",
  8100: "e1e8ff",
  8200: "e0e7ff",
  8300: "dee6ff",
  8400: "dde6ff",
  8500: "dce5ff",
  8600: "dae5ff",
  8700: "d9e3ff",
  8800: "d8e3ff",
  8900: "d7e2ff",
  9000: "d6e1ff",
  9100: "d4e1ff",
  9200: "d3e0ff",
  9300: "d2dfff",
  9400: "d1dfff",
  9500: "d0deff",
  9600: "cfddff",
  9700: "cfddff",
  9800: "cedcff",
  9900: "cddcff",
  10000: "cfdaff",
  10100: "cfdaff",
  10200: "ced9ff",
  10300: "cdd9ff",
  10400: "ccd8ff",
  10500: "ccd8ff",
  10600: "cbd7ff",
  10700: "cad7ff",
  10800: "cad6ff",
  10900: "c9d6ff",
  11000: "c8d5ff",
  11100: "c8d5ff",
  11200: "c7d4ff",
  11300: "c6d4ff",
  11400: "c6d4ff",
  11500: "c5d3ff",
  11600: "c5d3ff",
  11700: "c5d2ff",
  11800: "c4d2ff",
  11900: "c3d2ff",
  12000: "c3d1ff"
}

export function hexToRGB(hex: string) {
  const red = parseInt(hex.substring(0, 2), 16)
  const green = parseInt(hex.substring(2, 4), 16)
  const blue = parseInt(hex.substring(4, 6), 16)

  return { red, green, blue }
}

export function temperatureToRGB(temp: number) {
  temp = keepBetween(
    Math.round(temp / 100) * 100,
    parseInt(Object.keys(tempsToHex).at(0)),
    parseInt(Object.keys(tempsToHex).at(-1))
  )

  return hexToRGB(tempsToHex[temp] ?? "000000")
}

export function hsvToRGB(h: number, s: number, v: number) {
  let r: number, g: number, b: number

  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
  }

  return {
    red: Math.round(r * 255),
    green: Math.round(g * 255),
    blue: Math.round(b * 255)
  }
}
