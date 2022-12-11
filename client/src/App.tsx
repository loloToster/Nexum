import React, { useEffect, useState } from "react"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { QueryClient, QueryClientProvider } from "react-query"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { io, Socket } from "socket.io-client"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import { getBaseUrl } from "./config"

import {
  getUserFromStorage,
  UserProvider,
  UserContextConsumer
} from "./contexts/user"
import { SocketContext } from "./contexts/socket"

import Header from "./components/Header/Header"

import Login from "./screens/Login"
import Widgets from "./screens/Widgets"
import Devices from "./screens/Devices"
import Users from "./screens/Users"

DarkTheme.mode = "exact"
DarkTheme.colors.surface = "#565656"

const queryClient = new QueryClient()
const Stack = createStackNavigator()

function createSocket(url: string) {
  return io(url, {
    autoConnect: false,
    auth: async cb => {
      const user = await getUserFromStorage()
      cb({ as: "user", token: user.id })
    }
  })
}

function App() {
  const [socket, setSocket] = useState<Socket>()
  // used to refresh base url in socket
  // TODO: get rid of it
  const [urlBumper, setUrlBumber] = useState(0)

  useEffect(() => {
    getBaseUrl().then(url => setSocket(createSocket(url)))
  }, [urlBumper])

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        <UserProvider>
          <UserContextConsumer>
            {({ user }) =>
              user ? (
                <SocketContext.Provider value={{ socket }}>
                  <NavigationContainer linking={{ prefixes: [] }}>
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
                <Login onLogin={() => setUrlBumber(p => ++p)} />
              )
            }
          </UserContextConsumer>
        </UserProvider>
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  )
}

export default registerRootComponent(App)
