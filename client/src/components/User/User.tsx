import React, { useRef, useState } from "react"
import { View, StyleSheet, Dimensions, TextInput } from "react-native"
import {
  Theme,
  useTheme,
  Surface,
  Button,
  Switch,
  Text,
  Chip,
  IconButton,
  Portal,
  Modal,
  Divider,
  Colors,
  Dialog,
  Paragraph
} from "react-native-paper"
import QRCode from "react-native-qrcode-svg"

import config from "src/config"
import useObjectState from "src/hooks/useObjectState"

import { UserI } from "./types"

function User(props: {
  user: UserI
  deleteUser: (id: string) => void | Promise<void>
}) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user: initialUser, deleteUser } = props

  const [active, setActive] = useState(false)
  const [user, setUser] = useObjectState(initialUser)
  const [qrActive, setQrActive] = useState(false)
  const [deleteActive, setDeleteActive] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const nameInput = useRef<TextInput>()

  const handleDelete = async () => {
    setDeleteLoading(true)
    setDeleteActive(false)
    try {
      await deleteUser(user.id)
    } catch {
      setDeleteLoading(false)
    }
  }

  return (
    <Surface style={styles.user}>
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
      </Portal>
      <Portal>
        <Dialog visible={deleteActive}>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this user?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteActive(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Yes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Button
        contentStyle={styles.header}
        icon={active ? "chevron-down" : "chevron-left"}
        onPress={() => setActive(p => !p)}
      >
        <Text>{user.name}</Text>
      </Button>
      {active && (
        <View style={styles.metadata}>
          <View style={styles.row}>
            <Text numberOfLines={1}>ID: {user.id}</Text>
            <IconButton
              icon="qrcode"
              size={20}
              onPress={() => setQrActive(true)}
            />
          </View>
          <Divider />
          <View style={styles.row}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
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
              onPress={() => nameInput.current.focus()}
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
                style={styles.tab}
                key={i}
                mode="flat"
                closeIcon="minus-circle"
              >
                {tab.name}
              </Chip>
            ))}
            <IconButton style={[styles.tab, styles.addTab]} icon="plus" />
          </View>
          <Button
            style={styles.delete}
            icon="delete"
            color={Colors.red500}
            mode="contained"
            onPress={() => setDeleteActive(true)}
            loading={deleteLoading}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting" : "Delete"}
          </Button>
        </View>
      )}
    </Surface>
  )
}

export default User

const getStyles = (theme: Theme) => {
  const space = 10

  return StyleSheet.create({
    user: {
      backgroundColor: theme.colors.surface,
      marginBottom: space,
      borderRadius: theme.roundness,
      padding: space
    },
    header: {
      flexDirection: "row-reverse",
      justifyContent: "space-between"
    },
    metadata: {
      marginTop: space,
      marginHorizontal: 16
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
      marginTop: space
    },
    qrModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    qrWrapper: {
      backgroundColor: "white",
      padding: 20
    }
  })
}
