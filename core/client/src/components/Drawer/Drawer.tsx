import React, { useState } from "react"
import { Image, View, StyleSheet } from "react-native"

import { DrawerContentComponentProps } from "@react-navigation/drawer"

import { useTheme, Theme, Drawer, Avatar, Text } from "react-native-paper"
import { IconSource } from "react-native-paper/lib/typescript/components/Icon"

import { capitalizeFirstLetter } from "src/utils"

import { useUser } from "src/contexts/user"
import { useEditing } from "src/contexts/editing"

import Translatable from "src/components/Translatable/Translatable"
import RUSure from "src/components/RUSure/RUSure"

import microcontrollerIcon from "assets/microcontroller.png"
import microcontrollerActiveIcon from "assets/microcontroller-active.png"

const icons: Record<string, IconSource | undefined> = {
  widgets: "home",
  devices: ({ size, color }: { size: number; color: string }) => (
    <Image
      source={
        color.startsWith("#") // the active color is in hex and the inactive is in rgba
          ? microcontrollerActiveIcon
          : microcontrollerIcon
      }
      style={{ width: size, height: size }}
    />
  ),
  users: "account-multiple",
  googlehome: "lightbulb-group"
}

function DrawerContent({
  descriptors,
  navigation,
  state
}: DrawerContentComponentProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user, setUser } = useUser()
  const [logoutActive, setLogoutActive] = useState(false)

  const { setMoving, setEditing } = useEditing()

  const screens = Object.values(descriptors)
  const activeRouteName = state.routeNames[state.index]

  const gglhomeScreen = screens.find(s => s.route.name === "googlehome")

  return (
    <View>
      <RUSure
        open={logoutActive}
        onDismiss={() => setLogoutActive(false)}
        onConfirm={() => setUser(null)}
      >
        Are you sure you want to log out?
      </RUSure>
      <Drawer.Section>
        <View style={styles.profile}>
          <Avatar.Icon style={styles.avatar} size={54} icon="account" />
          <View>
            <Translatable>
              <View>
                <Text style={styles.loggedInAs}>Logged in as</Text>
              </View>
            </Translatable>
            <Text style={styles.username}>{user?.name}</Text>
          </View>
        </View>
      </Drawer.Section>
      {user?.isAdmin && (
        <Drawer.Section>
          {screens
            .filter(s => s.route.name !== "googlehome")
            .map(s => (
              <Drawer.Item
                label={
                  s.route.name === "widgets"
                    ? "Home"
                    : capitalizeFirstLetter(s.route.name)
                }
                icon={icons[s.route.name]}
                onPress={() => navigation.navigate(s.route.name)}
                active={activeRouteName === s.route.name}
                key={s.route.key}
              />
            ))}
        </Drawer.Section>
      )}
      {gglhomeScreen && (
        <Drawer.Section>
          <Drawer.Item
            label="Google Devices"
            icon={icons[gglhomeScreen.route.name]}
            onPress={() => navigation.navigate(gglhomeScreen.route.name)}
            active={activeRouteName === gglhomeScreen.route.name}
          />
        </Drawer.Section>
      )}
      {user?.isAdmin && (
        <Drawer.Section>
          <Drawer.Item
            label="Edit Widgets"
            icon="view-dashboard-edit"
            onPress={() => {
              setEditing(true)
              navigation.closeDrawer()
            }}
          />
          <Drawer.Item
            label="Move Widgets"
            icon="move-resize"
            onPress={() => {
              setMoving(true)
              navigation.closeDrawer()
            }}
          />
        </Drawer.Section>
      )}
      <Drawer.Section>
        <Drawer.Item
          label="Log out"
          icon="logout"
          theme={{
            ...theme,
            colors: { ...theme.colors, text: "#e62e4f" }
          }}
          onPress={() => setLogoutActive(true)}
        />
      </Drawer.Section>
    </View>
  )
}

export default DrawerContent

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    profile: {
      paddingHorizontal: 10,
      paddingVertical: 24,
      flexDirection: "row",
      alignItems: "center"
    },
    avatar: {
      marginRight: 10
    },
    loggedInAs: {
      fontSize: 12,
      color: theme.colors.placeholder
    },
    username: {
      fontSize: 24
    }
  })
}
