import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const apiHandler = axios.create()

// add saved user token to every request
apiHandler.interceptors.request.use(async config => {
  const token: string | null = await AsyncStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiHandler
