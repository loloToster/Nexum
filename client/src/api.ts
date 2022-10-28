import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

import config from "./config"

const apiHandler = axios.create({
  baseURL: config.apiBaseUrl[Platform.OS] || config.apiBaseUrl.default
})

// add saved user token to every request
apiHandler.interceptors.request.use(async config => {
  const token: string | null = await AsyncStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiHandler
