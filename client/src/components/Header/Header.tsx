import React, { useCallback } from "react"
import { Image } from "react-native"
import { StackHeaderProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Appbar } from "react-native-paper"

import { useUser } from "src/contexts/user"

// @ts-ignore
import microcontrollerIcon from "assets/microcontroller.png"

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
          <Appbar.Action
            color="black"
            icon={({ size }) => (
              <Image
                source={microcontrollerIcon}
                style={{ width: size, height: size }}
              />
            )}
            animated={false}
            onPress={() => null}
          />
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
