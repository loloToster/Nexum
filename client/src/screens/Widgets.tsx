import { View, Text } from "react-native"
import { useTheme } from "react-native-paper"

import { Tabs, TabScreen } from 'react-native-paper-tabs'

function Widgets() {
  const theme = useTheme()

  return (
    <Tabs mode="scrollable">
      {[...Array(5)].map((_, i) => (
        <TabScreen label={"Tab " + i}>
          <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <Text style={{ color: "#fff" }}>tab {i}</Text>
          </View>
        </TabScreen>
      ))}
    </Tabs>
  )
}

export default Widgets
