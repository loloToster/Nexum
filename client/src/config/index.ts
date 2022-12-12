import { Platform } from "react-native"

import devConfig from "./config.dev.json"
import prodConfig from "./config.prod.json"

interface Config {
  userCodePrefix: string
  apiBaseUrl: {
    default: string
    [key: string]: string
  }
}

const isProd = process.env.NODE_ENV === "production"
const config: Config = isProd ? prodConfig : devConfig

if (isProd && process.env.API_URL) {
  config.apiBaseUrl.default = process.env.API_URL
}

export function getBaseUrl() {
  return config.apiBaseUrl[Platform.OS] || config.apiBaseUrl.default
}

export default config
