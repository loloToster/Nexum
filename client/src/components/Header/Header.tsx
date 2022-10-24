import { useCallback } from "react"
import { StackHeaderProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Appbar } from "react-native-paper"

function Header({ options, back, navigation, route }: StackHeaderProps) {
  const title =
    typeof options.headerTitle == "string" ? options.headerTitle : "Nexum"

  const headerStyle = route.name === "widgets" ? { elevation: 0 } : {}

  const handleLogout = useCallback(() => {
    AsyncStorage.removeItem("token", () => {
      // TODO: go to login page
    })
  }, [])

  return (
    <Appbar.Header style={headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      <Appbar.Action icon="raspberry-pi" onPress={() => {}} />
      <Appbar.Action
        icon="account-multiple"
        onPress={() => navigation.navigate("users")}
      />
      <Appbar.Action icon="logout" onPress={handleLogout} />
    </Appbar.Header>
  )
}

export default Header
