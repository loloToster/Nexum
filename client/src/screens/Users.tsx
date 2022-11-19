import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { FAB } from "react-native-paper"
import { useMutation, useQuery } from "react-query"

import api from "src/api"
import { UserI } from "src/components/User/types"

import useDebounce from "src/hooks/useDebounce"

import SearchableList from "src/components/SearchableList/SearchableList"
import User from "src/components/User/User"
import AddUserModal from "src/components/AddUserModal/AddUserModal"

function Users() {
  const styles = getStyles()

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

  const renderUser = (user: UserI) => {
    return <User user={user} deleteUser={deleteUser} />
  }

  return (
    <>
      <AddUserModal
        visible={addUserModalActive}
        onDismiss={() => setAddUserModalActive(false)}
        onAdd={() => refetchUsers()}
      />
      <SearchableList
        data={data}
        titleKey={"name"}
        renderContent={renderUser}
        loading={isLoading}
        error={isError ? "Could not load users" : ""}
        onSearch={setSearchValue}
      ></SearchableList>
      <FAB
        style={styles.fab}
        icon="account-plus"
        onPress={() => setAddUserModalActive(true)}
      />
    </>
  )
}

export default Users

const getStyles = () => {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      margin: 24,
      right: 0,
      bottom: 0
    }
  })
}
