import React from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, MD2Theme, useTheme } from "react-native-paper"

function Loader() {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default Loader

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center"
    }
  })
}
