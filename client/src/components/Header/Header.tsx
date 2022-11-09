import { useCallback } from "react"
import { StackHeaderProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Appbar } from "react-native-paper"

import { useLoggedIn } from "../../contexts/loggedIn"

function Header({ options, back, navigation, route }: StackHeaderProps) {
  const { setLoggedIn } = useLoggedIn()

  const title =
    typeof options.headerTitle == "string" ? options.headerTitle : "Nexum"

  const headerStyle = route.name === "widgets" ? { elevation: 0 } : {}

  const handleLogout = useCallback(() => {
    AsyncStorage.removeItem("token", () => {
      setLoggedIn(false)
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
