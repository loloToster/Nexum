import React, { useState } from "react"
import { StyleSheet, Dimensions } from "react-native"
import {
  Theme,
  useTheme,
  Portal,
  Modal,
  ModalProps,
  Surface,
  TextInput,
  Button,
  Headline,
  HelperText
} from "react-native-paper"
import { AxiosError, AxiosResponse } from "axios"
import { useMutation } from "react-query"

import useObjectState from "src/hooks/useObjectState"
import api from "src/api"
import { Device } from "src/types"

type DeviceData = Omit<Device, "tabs">

const emptyDeviceData = {
  id: 0,
  token: "",
  name: ""
}

function ErrorText({ error }: { error: string }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <HelperText
      style={[styles.separator, error ? {} : { height: 0 }]}
      type="error"
    >
      {error}
    </HelperText>
  )
}

function AddDeviceModal(
  props: { onAdd: () => void } & Omit<ModalProps, "children" | "theme">
) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [deviceData, setDeviceData] = useObjectState<DeviceData>({
    ...emptyDeviceData
  })

  const [tokenError, setTokenError] = useState("")
  const [nameError, setNameError] = useState("")

  const handleDismiss = () => {
    setTokenError("")
    setNameError("")
    props.onDismiss && props.onDismiss()
  }

  const handleTokenChange = (val: string) => {
    setTokenError("")
    setDeviceData("token", val)
  }

  const handleNameChange = (val: string) => {
    setNameError(val ? "" : "Name is required")
    setDeviceData("name", val)
  }

  const addDeviceMutation = useMutation(
    "add-device",
    async (dd: DeviceData) => {
      if (!dd.name) {
        setNameError("Name is required")
        return null
      }

      setTokenError("")
      await new Promise(r => setTimeout(r, 1000))

      try {
        return await api.post("/devices", dd)
      } catch (err) {
        if (
          err instanceof AxiosError &&
          err.response?.status === 409 &&
          err.response?.data?.conflictOn == "id"
        ) {
          setTokenError("This id is alredy taken")
          return null
        }

        throw err
      }
    },
    {
      onSuccess: (res: AxiosResponse | null) => {
        if (!res) return
        setDeviceData({ ...emptyDeviceData })
        props.onAdd()
        handleDismiss()
      }
    }
  )

  return (
    <Portal>
      <Modal {...props} style={styles.modal} onDismiss={handleDismiss}>
        <Surface style={styles.modalContent}>
          <Headline style={styles.row}>Create device</Headline>
          <TextInput
            style={styles.row}
            label="Token (defaults to uuid)"
            mode="outlined"
            value={deviceData.token}
            onChangeText={handleTokenChange}
            error={Boolean(tokenError)}
          />
          <ErrorText error={tokenError} />
          <TextInput
            style={styles.row}
            label="Name"
            mode="outlined"
            value={deviceData.name}
            onChangeText={handleNameChange}
            error={Boolean(nameError)}
          />
          <ErrorText error={nameError} />
          <Button
            icon="plus"
            mode="contained"
            onPress={() => addDeviceMutation.mutate(deviceData)}
            loading={addDeviceMutation.isLoading}
            disabled={addDeviceMutation.isLoading}
          >
            {addDeviceMutation.isLoading ? "Adding Device" : "Add Device"}
          </Button>
        </Surface>
      </Modal>
    </Portal>
  )
}

export default AddDeviceModal

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    modal: {
      alignItems: "center",
      justifyContent: "center"
    },
    modalContent: {
      width: Dimensions.get("window").width / 1.2,
      padding: 20,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.background
    },
    row: {
      minHeight: 40
    },
    separator: {
      marginBottom: 15
    }
  })
}
