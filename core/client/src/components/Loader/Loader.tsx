import React from "react"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Theme, useTheme } from "react-native-paper"

function Loader() {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default Loader

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center"
    }
  })
}
