import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"

import { DarkTheme, Provider as PaperProvider } from "react-native-paper"

import Header from "./components/Header/Header"

const theme = DarkTheme

function App() {
  return (
    <PaperProvider theme={theme}>
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <Header />
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  )
}

export default registerRootComponent(App)
