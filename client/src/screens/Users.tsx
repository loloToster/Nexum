import { View, FlatList, StyleSheet } from "react-native"
import { Theme, useTheme, ActivityIndicator } from "react-native-paper"

import { useQuery } from "react-query"
import api from "../api"

import { UserI } from "../components/User/types"
import User from "../components/User/User"

function Users() {
  const theme = useTheme()

  const { isLoading, data } = useQuery("users", async () => {
    const res = await api.get("http://localhost:3000/users")
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
