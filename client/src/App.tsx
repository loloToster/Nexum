import React, { useEffect, useState } from "react"
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

import { UserContext, User } from "./contexts/user"
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
  autoConnect: false,
  auth: async cb => {
    const user = JSON.parse(await AsyncStorage.getItem("user"))
    cb({ as: "user", token: user.id })
  }
})

function App() {
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    socket.on("connect", () => console.log("connected"))
    socket.on("disconnect", () => console.log("disconnected"))

    AsyncStorage.getItem("user", (err, user) => {
      if (err) return
      if (user) setUser(JSON.parse(user))
    })
  }, [])

  // connect socket io on login
  useEffect(() => {
    if (user) socket.connect()
    else socket.disconnect()
  }, [user])

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        <UserContext.Provider value={{ user, setUser }}>
          {user ? (
            <SocketContext.Provider value={{ socket }}>
              <NavigationContainer linking={{ prefixes: [] }}>
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
        </UserContext.Provider>
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  )
}

export default registerRootComponent(App)
