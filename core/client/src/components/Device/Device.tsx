import React, { useRef, useState } from "react"
import { View, StyleSheet, TextInput } from "react-native"
import { useMutation } from "react-query"
import {
  Button,
  Text,
  IconButton,
  Divider,
  MD2Colors
} from "react-native-paper"

import api from "src/api"

import useDebounce from "src/hooks/useDebounce"
import useAfterMountEffect from "src/hooks/useAfterMountEffect"
import useObjectState from "src/hooks/useObjectState"

import { Device as DeviceI } from "src/types"

import RUSure from "src/components/RUSure/RUSure"
import CopyButton from "src/components/CopyButton/CopyButton"

function Device(props: {
  device: DeviceI
  deleteDevice: (id: number) => unknown
}) {
  const styles = getStyles()

  const { device: initialDevice, deleteDevice } = props

  const [device, setDevice] = useObjectState(initialDevice)
  const [deleteActive, setDeleteActive] = useState(false)

  const nameInput = useRef<TextInput>(null)

  interface EditMutationParams {
    id: number
    key: keyof DeviceI
    value: DeviceI[keyof DeviceI]
  }

  const editMutation = useMutation(
    "edit-device",
    async ({ id, key, value }: EditMutationParams) => {
      await api.patch("/devices/" + id, { key, value })
    }
  )

  const debouncedName = useDebounce(device.name)

  useAfterMountEffect(() => {
    editMutation.mutate({ id: device.id, key: "name", value: debouncedName })
  }, [debouncedName])

  const deleteMutation = useMutation(
    "delete-device",
    async (id: number) => {
      await api.delete("/devices/" + id)
      return id
    },
    {
      onSuccess: (id: number) => {
        deleteDevice(id)
      }
    }
  )

  const handleDelete = async () => {
    setDeleteActive(false)
    deleteMutation.mutate(device.id)
  }

  return (
    <View style={styles.container}>
      <RUSure
        open={deleteActive}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteActive(false)}
      >
        Are you sure you want to delete this device?
      </RUSure>
      <View style={styles.row}>
        <Text numberOfLines={1}>ID: {device.id}</Text>
      </View>
      <Divider />
      <View style={styles.row}>
        <Text numberOfLines={1}>Token: {device.token}</Text>
        <CopyButton text={device.token} />
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
          containerColor="transparent"
          size={20}
          onPress={() => nameInput.current?.focus()}
        />
      </View>
      <Button
        style={styles.delete}
        icon="delete"
        buttonColor={MD2Colors.red900}
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

export default Device

const getStyles = () => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 15
    },
    row: {
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
