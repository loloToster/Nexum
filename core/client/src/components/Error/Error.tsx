import React from "react"
import { View, StyleSheet } from "react-native"
import { Text, useTheme, MD2Theme, Avatar } from "react-native-paper"

function Error(props: { text?: string }) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  return (
    <View style={styles.container}>
      <Avatar.Icon
        style={styles.icon}
        color={theme.colors.error}
        icon="alert-circle"
      />
      <Text style={styles.text}>{props.text || "Something went wrong"}</Text>
    </View>
  )
}

export default Error

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background
    },
    text: {
      color: theme.colors.error,
      fontSize: 24,
      textAlign: "center",
      marginHorizontal: 20
    },
    icon: {
      margin: 10,
      width: 48,
      height: 48,
      backgroundColor: theme.colors.background
    }
  })
}
