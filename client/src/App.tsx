import { useCallback, useEffect, useState } from "react"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { QueryClient, QueryClientProvider } from "react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import Header from "./components/Header/Header"

import Login from "./screens/Login"
import Main from "./screens/Main"
import Users from "./screens/Users"

DarkTheme.mode = "exact"
const queryClient = new QueryClient()
const Stack = createStackNavigator()

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem("token", (err, token) => {
      if (err) return
      if (token) setLoggedIn(true)
    })
  }, [])

  const login = useCallback(
    (token: string) =>
      new Promise<void>((res, rej) => {
        AsyncStorage.setItem("token", token, err => {
          if (err) return rej(err)
          setLoggedIn(true)
          res()
        })
      }),
    []
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={DarkTheme}>
        {loggedIn ? (
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="widgets"
              screenOptions={{
                header: props => <Header {...props} />
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
        ) : (
          <Login login={login} />
        )}
        <StatusBar style="auto" />
      </PaperProvider>
    </QueryClientProvider>
  )
}

export default registerRootComponent(App)
