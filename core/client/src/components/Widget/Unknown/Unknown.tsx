import React from "react"
import { View, StyleSheet } from "react-native"
import { Text, List, useTheme, MD2Theme } from "react-native-paper"

import { ChoosenWidgetProps } from "../Widget"

import Translatable from "src/components/Translatable/Translatable"

function Unknown({ type }: ChoosenWidgetProps) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <List.Icon
          style={styles.icon}
          icon="alert"
          color={theme.colors.surface}
        />
        <Translatable>
          <View>
            <Text
              style={styles.text}
            >{`There is no\nwidget of "${type}" type`}</Text>
          </View>
        </Translatable>
      </View>
    </View>
  )
}

export default Unknown

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      padding: 5
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderColor: theme.colors.surface,
      borderWidth: 3,
      borderStyle: "dashed",
      padding: 10
    },
    icon: {
      margin: 0
    },
    text: {
      color: theme.colors.surface,
      textAlign: "center",
      fontWeight: "bold"
    }
  })
}
