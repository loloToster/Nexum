import React, { useRef, useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import {
  Button,
  Text,
  IconButton,
  Portal,
  Divider,
  Colors,
  Dialog,
  Paragraph
} from "react-native-paper"

import useObjectState from "src/hooks/useObjectState"

import { DeviceI } from "./types"

function Device(props: {
  device: DeviceI
  deleteDevice: (id: string) => void | Promise<void>
}) {
  const styles = getStyles()

  const { device: initialDevice, deleteDevice } = props

  const [device, setDevice] = useObjectState(initialDevice)
  const [deleteActive, setDeleteActive] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const nameInput = useRef<TextInput>()

  const handleDelete = async () => {
    setDeleteLoading(true)
    setDeleteActive(false)
    try {
      await deleteDevice(device.id)
    } catch {
      setDeleteLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Portal>
        <Dialog visible={deleteActive}>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this device?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteActive(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Yes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={styles.row}>
        <Text numberOfLines={1}>ID: {device.id}</Text>
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
            value={device.name}
            onChangeText={t => setDevice("name", t)}
          />
        </View>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() => nameInput.current.focus()}
        />
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
  )
}

export default Device

const getStyles = () => {
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
    delete: {
      marginVertical: 10
    }
  })
}
