import axios from "axios"

import { getBaseUrl } from "./config"
import { getUserFromStorage } from "./contexts/user"

const apiHandler = axios.create({
  baseURL: getBaseUrl()
})

// add saved user token to every request
apiHandler.interceptors.request.use(async axiosConfig => {
  try {
    const user = await getUserFromStorage()
    if (user) axiosConfig.headers.Authorization = `Bearer ${user.id}`
  } catch (e) {
    console.error(e)
  }

  return axiosConfig
})

export default apiHandler
