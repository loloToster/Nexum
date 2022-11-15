import devConfig from "./config.dev.json"
import prodConfig from "./config.prod.json"

interface Config {
  userCodePrefix: string
  apiBaseUrl: {
    default: string
    [key: string]: string
  }
}

// TODO: evaluate if prod or dev
const isProd = false
const config: Config = isProd ? prodConfig : devConfig

export default config
