import React from "react"

import { DrawerHeaderProps } from "@react-navigation/drawer"
import { getHeaderTitle } from "@react-navigation/elements"

import { Appbar } from "react-native-paper"

function Header({ options, navigation, route }: DrawerHeaderProps) {
  return (
    <Appbar.Header style={{ elevation: 0 }}>
      {route.name !== "widgets" && (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      <Appbar.Content title={getHeaderTitle(options, route.name)} />
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
    </Appbar.Header>
  )
}

export default Header
