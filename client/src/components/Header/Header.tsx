import React, { useCallback } from "react"
import { Image } from "react-native"
import { StackHeaderProps } from "@react-navigation/stack"
import { Appbar } from "react-native-paper"

import { useUser } from "src/contexts/user"

// @ts-ignore
import microcontrollerIcon from "assets/microcontroller.png"

function Header({ options, navigation }: StackHeaderProps) {
  const { user, setUser } = useUser()

  const onSubRoute = typeof options.headerTitle == "string"

  const title = onSubRoute ? (options.headerTitle as string) : "Nexum"

  const handleLogout = useCallback(async () => {
    setUser(null)
  }, [])

  return (
    <Appbar.Header style={{ elevation: 0 }}>
      {onSubRoute && (
        <Appbar.BackAction onPress={() => navigation.navigate("widgets")} />
      )}
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
            onPress={() => navigation.navigate("devices")}
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
