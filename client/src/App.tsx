import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import Header from "./components/Header/Header"
import Widgets from "./screens/Widgets"
import Users from "./screens/Users"

DarkTheme.mode = "exact"

const Stack = createStackNavigator()

function App() {
  return (
    <NavigationContainer>
      <PaperProvider theme={DarkTheme}>
        <Stack.Navigator
          initialRouteName="widgets"
          screenOptions={{
            header: props => <Header {...props} />
          }}>
          <Stack.Screen name="widgets" component={Widgets} />
          <Stack.Screen name="users" component={Users} options={{ headerTitle: "Users" }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </PaperProvider>
    </NavigationContainer>
  )
}

export default registerRootComponent(App)
