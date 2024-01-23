import "react-native-gesture-handler"

import React, { lazy, Suspense, useEffect } from "react"
import { Dimensions, Platform } from "react-native"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { QueryClient, QueryClientProvider } from "react-query"

import { NavigationContainer } from "@react-navigation/native"
import { createDrawerNavigator } from "@react-navigation/drawer"

import { io } from "socket.io-client"

import {
  ActivityIndicator,
  DarkTheme,
  Modal,
  Portal,
  Provider as PaperProvider
} from "react-native-paper"

import { getBaseUrl } from "./config"
import { ACCENT_COLOR, PRIMARY_COLOR, SURFACE_COLOR } from "./consts"

import {
  getUserFromStorage,
  UserProvider,
  UserContextConsumer
} from "./contexts/user"
import { EditingContext, EditingContextProvider } from "./contexts/editing"
import { SocketContext } from "./contexts/socket"

import Header from "./components/Header/Header"
import DrawerContent from "./components/Drawer/Drawer"
import Loader from "./components/Loader/Loader"

import Widgets from "./screens/Widgets"

const Login = lazy(() => import("./screens/Login"))
const Users = lazy(() => import("./screens/Users"))
const Devices = lazy(() => import("./screens/Devices"))

DarkTheme.mode = "exact"
DarkTheme.colors.surface = SURFACE_COLOR
DarkTheme.colors.primary = PRIMARY_COLOR
DarkTheme.colors.accent = ACCENT_COLOR

const queryClient = new QueryClient()
const Drawer = createDrawerNavigator()

const socket = io(getBaseUrl(), {
  autoConnect: false,
  auth: async cb => {
    const user = await getUserFromStorage()
    cb({ as: "user", token: user?.id })
  }
})

function App() {
  if (Platform.OS === "web")
    useEffect(() => {
      /**
       * disable translation of entire document.
       * can be overridden by `Translatable` component
       */
      const html = document.querySelector("html")
      if (html) html.translate = false

      /**
       * hotfix for drawer nav causing overflow
       */
      const root = document.getElementById("root")
      if (root) root.style.overflowX = "hidden"
    })

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        <Suspense fallback={<Loader />}>
          <UserProvider>
            <UserContextConsumer>
              {({ user }) =>
                user ? (
                  <EditingContextProvider>
                    <EditingContext.Consumer>
                      {({ saving }) => (
                        <SocketContext.Provider value={{ socket }}>
                          <Portal>
                            <Modal visible={saving} dismissable={false}>
                              <ActivityIndicator
                                size="large"
                                style={{
                                  height: Dimensions.get("screen").height
                                }}
                              />
                            </Modal>
                          </Portal>
                          <NavigationContainer
                            documentTitle={{ enabled: false }}
                            linking={{ prefixes: [] }}
                          >
                            <Drawer.Navigator
                              initialRouteName="widgets"
                              backBehavior="initialRoute"
                              drawerContent={DrawerContent}
                              screenOptions={{
                                header: props => <Header {...props} />,
                                drawerPosition: "right",
                                drawerStyle: {
                                  backgroundColor: DarkTheme.colors.background
                                },
                                lazy: true
                              }}
                            >
                              <Drawer.Screen
                                name="widgets"
                                component={Widgets}
                                options={{ headerTitle: "Nexum" }}
                              />
                              <Drawer.Screen
                                name="devices"
                                component={Devices}
                                options={{ headerTitle: "Devices" }}
                              />
                              <Drawer.Screen
                                name="users"
                                component={Users}
                                options={{ headerTitle: "Users" }}
                              />
                            </Drawer.Navigator>
                          </NavigationContainer>
                        </SocketContext.Provider>
                      )}
                    </EditingContext.Consumer>
                  </EditingContextProvider>
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
