import { StatusBar } from "expo-status-bar"
import { View } from "react-native"

import { Appbar, DarkTheme, Provider as PaperProvider, withTheme } from "react-native-paper"

const theme = DarkTheme

function App() {
  return (
    <PaperProvider theme={theme}>
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <Appbar.Header>
          <Appbar.Content title="Nexum" />
          <Appbar.Action icon="raspberry-pi" onPress={() => { }} />
          <Appbar.Action icon="account-multiple" onPress={() => { }} />
        </Appbar.Header>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  )
}

export default App
