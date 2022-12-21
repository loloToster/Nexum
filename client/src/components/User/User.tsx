import React, { useRef, useState } from "react"
import { View, StyleSheet, Dimensions, TextInput } from "react-native"
import { useMutation } from "react-query"
import {
  Button,
  Switch,
  Text,
  Chip,
  IconButton,
  Portal,
  Modal,
  Divider,
  Colors,
  Headline,
  Surface,
  Theme,
  useTheme
} from "react-native-paper"
import QRCode from "react-native-qrcode-svg"

import api from "src/api"

import config from "src/config"

import useDebounce from "src/hooks/useDebounce"
import useAfterMountEffect from "src/hooks/useAfterMountEffect"
import useObjectState from "src/hooks/useObjectState"

import { User as UserI, Tab as TabI } from "src/types"

import RUSure from "src/components/RUSure/RUSure"

export interface UserProps {
  user: UserI
  tabs: TabI[]
  deleteUser: (id: string) => unknown
}

function User(props: UserProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user: initialUser, tabs, deleteUser } = props

  const [user, setUser] = useObjectState(initialUser)
  const [qrActive, setQrActive] = useState(false)
  const [tabsModalActive, setTabsModalActive] = useState(false)
  const [deleteActive, setDeleteActive] = useState(false)

  const nameInput = useRef<TextInput>(null)

  const deleteMutation = useMutation(
    "delete-user",
    async (id: string) => {
      await api.delete("/users/" + id)
      return id
    },
    {
      onSuccess: (id: string) => {
        deleteUser(id)
      }
    }
  )

  const handleDelete = async () => {
    setDeleteActive(false)
    deleteMutation.mutate(user.id)
  }

  interface EditMutationParams {
    id: string
    key: keyof UserI
    value: UserI[keyof UserI]
  }

  const editMutation = useMutation(
    "edit-user",
    async ({ id, key, value }: EditMutationParams) => {
      await api.patch("/users/" + id, { key, value })
    }
  )

  // attach edit listeners
  const editableFields: (keyof UserI)[] = ["name", "isAdmin"]
  editableFields.forEach(field => {
    const debouncedState = useDebounce(user[field])

    useAfterMountEffect(() => {
      editMutation.mutate({ id: user.id, key: field, value: debouncedState })
    }, [debouncedState])
  })

  const userTabsIds = user.tabs.map(t => t.id)
  const modalTabs = tabs.filter(t => !userTabsIds.includes(t.id))

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          style={styles.qrModal}
          visible={qrActive}
          onDismiss={() => setQrActive(false)}
        >
          <View style={styles.qrWrapper}>
            <QRCode
              size={Dimensions.get("window").width / 1.5}
              value={config.userCodePrefix + user.id}
            />
          </View>
        </Modal>
        <Modal
          style={styles.tabsModal}
          visible={tabsModalActive}
          onDismiss={() => setTabsModalActive(false)}
        >
          <Surface style={styles.tabsModalContent}>
            <Headline style={styles.row}>Add tab</Headline>
            <View style={styles.tabs}>
              {modalTabs.map(tab => (
                <Chip
                  onPress={() =>
                    setUser(prev => {
                      const newTabs = [...prev.tabs, tab]

                      editMutation.mutate({
                        id: prev.id,
                        key: "tabs",
                        value: newTabs
                      })

                      return { ...prev, tabs: newTabs }
                    })
                  }
                  style={styles.tab}
                  key={tab.id}
                  mode="flat"
                >
                  {tab.name}
                </Chip>
              ))}
            </View>
          </Surface>
        </Modal>
      </Portal>
      <RUSure
        open={deleteActive}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteActive(false)}
      >
        Are you sure you want to delete this user?
      </RUSure>
      <View style={styles.row}>
        <Text numberOfLines={1}>ID: {user.id}</Text>
        <IconButton icon="qrcode" size={20} onPress={() => setQrActive(true)} />
      </View>
      <Divider />
      <View style={styles.row}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 5 }}>Name:</Text>
          <TextInput
            style={{
              borderWidth: 0,
              color: "white"
            }}
            ref={nameInput}
            value={user.name}
            onChangeText={t => setUser("name", t)}
          />
        </View>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() => nameInput.current?.focus()}
        />
      </View>
      <Divider />
      <View style={styles.row}>
        <Text>Administrator privilages:</Text>
        <Switch
          value={user.isAdmin}
          onValueChange={v => setUser("isAdmin", v)}
        />
      </View>
      <Divider />
      <Text style={{ marginTop: 10 }}>Available tabs:</Text>
      <View style={styles.tabs}>
        {user.tabs.map((tab, i) => (
          <Chip
            onClose={() =>
              setUser(prev => {
                const newTabs = prev.tabs.filter(t => t.id !== tab.id)

                editMutation.mutate({
                  id: prev.id,
                  key: "tabs",
                  value: newTabs
                })

                return { ...prev, tabs: newTabs }
              })
            }
            style={styles.tab}
            key={i}
            mode="flat"
            closeIcon="minus-circle"
          >
            {tab.name}
          </Chip>
        ))}
        <IconButton
          disabled={!modalTabs.length}
          onPress={() => setTabsModalActive(true)}
          style={[styles.tab, styles.addTab]}
          icon="plus"
        />
      </View>
      <Button
        style={styles.delete}
        icon="delete"
        color={Colors.red500}
        mode="contained"
        onPress={() => setDeleteActive(true)}
        loading={deleteMutation.isLoading}
        disabled={deleteMutation.isLoading}
      >
        {deleteMutation.isLoading ? "Deleting" : "Delete"}
      </Button>
    </View>
  )
}

export default User

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 15
    },
    row: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 50
    },
    tabs: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    tab: {
      marginVertical: 2.5,
      marginRight: 2.5,
      marginLeft: 0
    },
    addTab: {
      height: 32,
      width: 32,
      borderRadius: 16,
      backgroundColor: "#383838"
    },
    delete: {
      marginVertical: 10
    },
    qrModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    qrWrapper: {
      backgroundColor: "white",
      padding: 20
    },
    tabsModal: {
      alignItems: "center",
      justifyContent: "center"
    },
    tabsModalContent: {
      width: Dimensions.get("window").width / 1.2,
      padding: 20,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.background
    }
  })
}
