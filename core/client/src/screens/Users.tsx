import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { FAB } from "react-native-paper"
import { useQuery } from "react-query"

import api from "src/api"
import { User as UserI } from "src/types"

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
    isLoading: usersLoading,
    isError: usersError,
    data: users,
    refetch: refetchUsers
  } = useQuery(["users", debouncedSearchValue], async ({ queryKey }) => {
    const query = encodeURIComponent(queryKey[1] || "")
    const params = query ? `?q=${query}` : query
    const res = await api.get("/users" + params)
    return res.data
  })

  const {
    isLoading: tabsLoading,
    isError: tabsError,
    data: tabs
  } = useQuery(["tabs"], async () => {
    const res = await api.get("/tabs")
    return res.data
  })

  const renderUser = (user: UserI) => {
    return <User user={user} tabs={tabs} deleteUser={() => refetchUsers()} />
  }

  const error = usersError
    ? "Could not load users"
    : tabsError
      ? "Could not load tabs"
      : ""

  return (
    <>
      <AddUserModal
        visible={addUserModalActive}
        onDismiss={() => setAddUserModalActive(false)}
        onAdd={() => refetchUsers()}
      />
      <SearchableList
        data={users}
        renderTitle={i => i.name}
        renderContent={renderUser}
        loading={usersLoading || tabsLoading}
        error={error}
        notFound="No users where found"
        onSearch={setSearchValue}
      />
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
