import { useState } from "react"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import Header from "./components/Header/Header"

import Login from "./screens/Login"
import Main from "./screens/Main"
import Users from "./screens/Users"

DarkTheme.mode = "exact"

const Stack = createStackNavigator()

function App() {
  const [loggedIn, setLoggedIn] = useState(true)

  return (
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
        <Login />
      )}
      <StatusBar style="auto" />
    </PaperProvider>
  )
}

export default registerRootComponent(App)
