import React, { useState } from "react"
import { View, StyleSheet } from "react-native"
import { useTheme, Theme, Surface, Button, Text } from "react-native-paper"

function ListItem(props: { name: string; children?: React.ReactNode }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [active, setActive] = useState(false)

  return (
    <Surface style={styles.container}>
      <Button
        contentStyle={styles.header}
        icon={active ? "chevron-down" : "chevron-left"}
        onPress={() => setActive(p => !p)}
      >
        <Text>{props.name}</Text>
      </Button>
      {active && <View style={styles.content}>{props.children}</View>}
    </Surface>
  )
}

export default ListItem

const getStyles = (theme: Theme) => {
  const space = 10

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginBottom: space,
      borderRadius: theme.roundness,
      padding: space
    },
    header: {
      flexDirection: "row-reverse",
      justifyContent: "space-between"
    },
    content: {
      marginTop: space,
      marginHorizontal: 16
    }
  })
}
