import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

import config from "./config"
import { User } from "./contexts/user"

const apiHandler = axios.create({
  baseURL: config.apiBaseUrl[Platform.OS] || config.apiBaseUrl.default
})

// add saved user token to every request
apiHandler.interceptors.request.use(async config => {
  try {
    const user: User = JSON.parse(await AsyncStorage.getItem("user"))
    if (user) config.headers.Authorization = `Bearer ${user.id}`
  } catch (e) {
    console.error(e)
  }

  return config
})

export default apiHandler
