import { Platform } from "react-native"

import devConfig from "./config.dev.json"
import prodConfig from "./config.prod.json"

interface Config {
  userCodePrefix: string
  baseUrl: {
    default: string
    [key: string]: string
  }
}

const isProd = process.env.NODE_ENV === "production"
const config: Config = isProd ? prodConfig : devConfig

if (isProd && process.env.API_URL) {
  config.baseUrl.default = process.env.API_URL
}

export function getBaseUrl() {
  return config.baseUrl[Platform.OS] || config.baseUrl.default
}

export default config
