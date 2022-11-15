import { useCallback } from "react"
import { StackHeaderProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Appbar } from "react-native-paper"

import { useUser } from "../../contexts/user"

function Header({ options, back, navigation, route }: StackHeaderProps) {
  const { user, setUser } = useUser()

  const title =
    typeof options.headerTitle == "string" ? options.headerTitle : "Nexum"

  const headerStyle = route.name === "widgets" ? { elevation: 0 } : {}

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("user")
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <Appbar.Header style={headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {user?.isAdmin && (
        <>
          <Appbar.Action color="black" icon="raspberry-pi" onPress={() => {}} />
          <Appbar.Action
            color="black"
            icon="account-multiple"
            onPress={() => navigation.navigate("users")}
          />
        </>
      )}
      <Appbar.Action icon="logout" onPress={handleLogout} />
    </Appbar.Header>
  )
}

export default Header
