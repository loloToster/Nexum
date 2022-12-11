import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

import devConfig from "./config.dev.json"
import prodConfig from "./config.prod.json"

interface Config {
  userCodePrefix: string
  tokenUrlSeparator: string
  apiBaseUrl: {
    default: string
    [key: string]: string
  }
}

// TODO: evaluate if prod or dev
const isProd = false
const config: Config = isProd ? prodConfig : devConfig

export async function setBaseUrl(url: string | null) {
  if (url) await AsyncStorage.setItem("baseUrl", url)
  else await AsyncStorage.removeItem("baseUrl")
}

export async function getBaseUrl() {
  try {
    const savedUrl = await AsyncStorage.getItem("baseUrl")
    if (savedUrl) return savedUrl
  } catch (err) {
    console.warn(err)
  }

  return config.apiBaseUrl[Platform.OS] || config.apiBaseUrl.default
}

export default config
