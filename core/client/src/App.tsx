import React, { lazy, Suspense, useEffect } from "react"
import { Platform } from "react-native"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { QueryClient, QueryClientProvider } from "react-query"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { io } from "socket.io-client"

import {
  Colors,
  DarkTheme,
  Provider as PaperProvider
} from "react-native-paper"

import { getBaseUrl } from "./config"

import {
  getUserFromStorage,
  UserProvider,
  UserContextConsumer
} from "./contexts/user"
import { SocketContext } from "./contexts/socket"

import Header from "./components/Header/Header"
import Loader from "./components/Loader/Loader"

const Login = lazy(() => import("./screens/Login"))
const Widgets = lazy(() => import("./screens/Widgets"))
const Users = lazy(() => import("./screens/Users"))
const Devices = lazy(() => import("./screens/Devices"))

DarkTheme.mode = "exact"
DarkTheme.colors.surface = "#565656"
DarkTheme.colors.primary = Colors.teal300
DarkTheme.colors.accent = Colors.cyan400

const queryClient = new QueryClient()
const Stack = createStackNavigator()

const socket = io(getBaseUrl(), {
  autoConnect: false,
  auth: async cb => {
    const user = await getUserFromStorage()
    cb({ as: "user", token: user?.id })
  }
})

function App() {
  /**
   * disable translation of entire document.
   * can be overridden by `Translatable` component
   */
  if (Platform.OS === "web")
    useEffect(() => {
      const html = document.querySelector("html")
      if (html) html.translate = false
    })

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        <Suspense fallback={<Loader />}>
          <UserProvider>
            <UserContextConsumer>
              {({ user }) =>
                user ? (
                  <SocketContext.Provider value={{ socket }}>
                    <NavigationContainer
                      documentTitle={{ enabled: false }}
                      linking={{ prefixes: [] }}
                    >
                      <Stack.Navigator
                        initialRouteName="widgets"
                        screenOptions={{
                          header: props => <Header {...props} />,
                          headerMode: "float"
                        }}
                      >
                        <Stack.Screen name="widgets" component={Widgets} />
                        <Stack.Screen
                          name="devices"
                          component={Devices}
                          options={{ headerTitle: "Devices" }}
                        />
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
                )
              }
            </UserContextConsumer>
          </UserProvider>
        </Suspense>
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  )
}

export default registerRootComponent(App)
