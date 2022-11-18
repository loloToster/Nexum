import React, { useRef, useState } from "react"
import { View, FlatList, StyleSheet, TextInput } from "react-native"
import {
  Theme,
  useTheme,
  ActivityIndicator,
  Searchbar,
  FAB
} from "react-native-paper"
import { useMutation, useQuery } from "react-query"

import api from "src/api"
import { UserI } from "src/components/User/types"

import useDebounce from "src/hooks/useDebounce"

import User from "src/components/User/User"
import Error from "src/components/Error/Error"
import AddUserModal from "src/components/AddUserModal/AddUserModal"

function Users() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const searchBar = useRef<TextInput>()
  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebounce(searchValue)
  const [addUserModalActive, setAddUserModalActive] = useState(false)

  const {
    isLoading,
    isError,
    data,
    refetch: refetchUsers
  } = useQuery(["users", debouncedSearchValue], async ({ queryKey }) => {
    const query = encodeURIComponent(queryKey[1] || "")
    const params = query ? `?q=${query}` : query
    const res = await api.get("/users" + params)
    return res.data
  })

  const deleteMutation = useMutation(
    "delete-user",
    async (id: string) => {
      await api.delete("users", { data: { id } })
    },
    {
      onSuccess: () => {
        refetchUsers()
      }
    }
  )

  const deleteUser = (id: string) => {
    deleteMutation.mutate(id)
  }

  const renderUser = ({ item: user }: { item: UserI }) => {
    return <User user={user} deleteUser={deleteUser} />
  }

  return (
    <View style={styles.container}>
      <AddUserModal
        visible={addUserModalActive}
        onDismiss={() => setAddUserModalActive(false)}
        onAdd={() => refetchUsers()}
      />
      <Searchbar
        ref={searchBar}
        style={styles.search}
        value={searchValue}
        placeholder="Search by name or id"
        onChangeText={setSearchValue}
      />
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <Error text="Could not get users" />
      ) : (
        <FlatList data={data} renderItem={renderUser} />
      )}

      <FAB
        style={styles.fab}
        icon="account-plus"
        onPress={() => setAddUserModalActive(true)}
      />
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
    search: {
      marginBottom: space
    },
    loadingWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
