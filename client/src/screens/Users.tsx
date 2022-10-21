import { useState } from "react"
import { View, FlatList, StyleSheet } from "react-native"
import { Theme, useTheme } from "react-native-paper"

import { UserI } from "../components/User/types"
import User from "../components/User/User"

function Users() {
  const theme = useTheme()

  const dummyTabs = [...Array(7)].map((_, i) => "Tab " + i)
  const [users, setUsers] = useState<UserI[]>([
    { id: "1", name: "test 1", isAdmin: true, tabs: dummyTabs },
    { id: "2", name: "test 2", isAdmin: false, tabs: dummyTabs },
    { id: "3", name: "test 3", isAdmin: false, tabs: dummyTabs }
  ])

  const styles = getStyles(theme)

  const renderUser = ({ item: user }: { item: UserI }) => {
    return <User user={user} />
  }

  return (
    <View style={styles.container}>
      <FlatList data={users} renderItem={renderUser} />
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
    }
  })
}
