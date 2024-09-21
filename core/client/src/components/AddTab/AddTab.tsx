import React, { useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import {
  Button,
  Headline,
  TextInput,
  Theme,
  useTheme
} from "react-native-paper"

import { useMutation } from "react-query"
import api from "src/api"

export interface AddTabProps {
  onTabCreate?: (id: number, tabName: string) => any
}

// TODO: add error handling
function AddTab({ onTabCreate = () => null }: AddTabProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [name, setName] = useState("")

  const addTabMutation = useMutation(
    "add-tab",
    async (tabName: string) => {
      const res = await api.post("/tabs", { name: tabName })
      return res.data
    },
    {
      onSuccess: ({ id, name }) => {
        onTabCreate(id, name)
      }
    }
  )

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Headline style={styles.head}>Create a tab</Headline>
        <TextInput
          label="Tab name"
          mode="outlined"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <Button
          icon="plus"
          mode="contained"
          onPress={() => addTabMutation.mutate(name)}
          loading={addTabMutation.isLoading}
          disabled={!name || addTabMutation.isLoading}
        >
          Create
        </Button>
      </View>
    </View>
  )
}

export default AddTab

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center"
    },
    wrapper: {
      width: Dimensions.get("window").width / 1.3
    },
    head: {
      marginBottom: 5
    },
    input: {
      marginBottom: 20
    }
  })
}
