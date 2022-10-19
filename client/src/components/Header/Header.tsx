import { StackHeaderProps } from "@react-navigation/stack"
import { Appbar } from "react-native-paper"

function Header({ options, back, navigation, route }: StackHeaderProps) {
  const title = typeof options.headerTitle == "string" ? options.headerTitle : "Nexum"

  const headerStyle = route.name === "widgets" ? { elevation: 0 } : {}

  return (
    <Appbar.Header style={headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      <Appbar.Action icon="raspberry-pi" onPress={() => { }} />
      <Appbar.Action icon="account-multiple" onPress={() => navigation.navigate("users")} />
    </Appbar.Header>
  )
}

export default Header
