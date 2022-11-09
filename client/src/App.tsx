import { useEffect, useState } from "react"
import { Platform } from "react-native"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { QueryClient, QueryClientProvider } from "react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { io } from "socket.io-client"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import config from "./config"

import { LoggedInContext } from "./contexts/loggedIn"
import { SocketContext } from "./contexts/socket"

import Header from "./components/Header/Header"

import Login from "./screens/Login"
import Main from "./screens/Main"
import Users from "./screens/Users"

DarkTheme.mode = "exact"
DarkTheme.colors.surface = "#565656"

const queryClient = new QueryClient()
const Stack = createStackNavigator()

const socket = io(config.apiBaseUrl[Platform.OS] || config.apiBaseUrl.default, {
  autoConnect: false
})

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    socket.on("connect", () => console.log("connected"))
    socket.on("disconnect", () => console.log("disconnected"))

    AsyncStorage.getItem("token", (err, token) => {
      if (err) return
      if (token) setLoggedIn(true)
    })
  }, [])

  // connect socket io on login
  useEffect(() => {
    if (loggedIn) socket.connect()
    else socket.disconnect()
  }, [loggedIn])

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
          {loggedIn ? (
            <SocketContext.Provider value={{ socket }}>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="widgets"
                  screenOptions={{
                    header: props => <Header {...props} />,
                    headerMode: "float"
                  }}
                >
                  <Stack.Screen name="widgets" component={Main} />
                  <Stack.Screen
                    name="users"
                    component={Users}
                    options={{ headerTitle: "Users" }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </SocketContext.Provider>
          ) : (
            <Login />
          )}
        </LoggedInContext.Provider>
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  )
}

export default registerRootComponent(App)
