import React from "react"

import { DrawerHeaderProps } from "@react-navigation/drawer"
import { getHeaderTitle } from "@react-navigation/elements"

import { Appbar } from "react-native-paper"

import { useEditing } from "src/contexts/editing"

function Header({ options, navigation, route }: DrawerHeaderProps) {
  const { editing, setEditing, setSaving } = useEditing()

  return (
    <Appbar.Header style={{ elevation: 0 }}>
      {route.name !== "widgets" && (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      <Appbar.Content title={getHeaderTitle(options, route.name)} />
      {editing && (
        <Appbar.Action
          icon="check"
          onPress={() => {
            setEditing(false)
            setSaving(true)
            setTimeout(() => {
              setSaving(false)
            }, 3000)
          }}
        />
      )}
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
    </Appbar.Header>
  )
}

export default Header
