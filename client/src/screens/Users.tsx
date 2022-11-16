import React from "react"
import { View, FlatList, StyleSheet } from "react-native"
import { Theme, useTheme, ActivityIndicator } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"

import { UserI } from "src/components/User/types"
import User from "src/components/User/User"
import Error from "src/components/Error/Error"

function Users() {
  const theme = useTheme()

  const { isLoading, isError, data } = useQuery("users", async () => {
    const res = await api.get("/users")
    return res.data
  })

  const styles = getStyles(theme)

  const renderUser = ({ item: user }: { item: UserI }) => {
    return <User user={user} />
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <Error text="Could not get users" />
      ) : (
        <FlatList data={data} renderItem={renderUser} />
      )}
    </View>
  )
}

export default Users

const getStyles = (theme: Theme) => {
  const space = 10

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
      padding: space,
      paddingBottom: 0
    },
    loadingWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }
  })
}
