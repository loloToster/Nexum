import React, { useState } from "react"
import { StyleSheet, Dimensions, View } from "react-native"
import {
  Theme,
  useTheme,
  Portal,
  Modal,
  ModalProps,
  Surface,
  TextInput,
  Text,
  Button,
  Switch,
  Headline,
  HelperText
} from "react-native-paper"
import { AxiosError, AxiosResponse } from "axios"
import { useMutation } from "react-query"

import useObjectState from "src/hooks/useObjectState"
import api from "src/api"
import { UserI } from "src/components/User/types"

type UserData = Omit<UserI, "tabs">

const emptyUserData = {
  id: "",
  name: "",
  isAdmin: false
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

function AddUserModal(
  props: { onAdd: () => void } & Omit<ModalProps, "children" | "theme">
) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [userData, setUserData] = useObjectState<UserData>({ ...emptyUserData })

  const [idError, setIdError] = useState("")
  const [nameError, setNameError] = useState("")

  const handleDismiss = () => {
    setIdError("")
    setNameError("")
    props.onDismiss()
  }

  const handleIdChange = (val: string) => {
    setIdError("")
    setUserData("id", val)
  }

  const handleNameChange = (val: string) => {
    setNameError(val ? "" : "Name is required")
    setUserData("name", val)
  }

  const handleAdminChange = (val: boolean) => {
    setUserData("isAdmin", val)
  }

  const addUserMutation = useMutation(
    "add-user",
    async (ud: UserData) => {
      if (!ud.name) {
        setNameError("Name is required")
        return null
      }

      setIdError("")
      await new Promise(r => setTimeout(r, 1000))

      try {
        return await api.post("/users", ud)
      } catch (err) {
        if (
          err instanceof AxiosError &&
          err.response?.status === 409 &&
          err.response?.data?.conflictOn == "id"
        ) {
          setIdError("This id is alredy taken")
          return null
        }

        throw err
      }
    },
    {
      onSuccess: (res: AxiosResponse | null) => {
        if (!res) return
        setUserData({ ...emptyUserData })
        props.onAdd()
        handleDismiss()
      }
    }
  )

  return (
    <Portal>
      <Modal {...props} style={styles.modal} onDismiss={handleDismiss}>
        <Surface style={styles.modalContent}>
          <Headline style={styles.row}>Create user</Headline>
          <TextInput
            style={styles.row}
            label="ID (defaults to uuid)"
            mode="outlined"
            value={userData.id}
            onChangeText={handleIdChange}
            error={Boolean(idError)}
          />
          <ErrorText error={idError} />
          <TextInput
            style={styles.row}
            label="Name"
            mode="outlined"
            value={userData.name}
            onChangeText={handleNameChange}
            error={Boolean(nameError)}
          />
          <ErrorText error={nameError} />
          <View style={[styles.row, styles.separator, styles.administratorRow]}>
            <Text>Administrator:</Text>
            <Switch
              value={userData.isAdmin}
              onValueChange={handleAdminChange}
            />
          </View>
          <Button
            icon="plus"
            mode="contained"
            onPress={() => addUserMutation.mutate(userData)}
            loading={addUserMutation.isLoading}
            disabled={addUserMutation.isLoading}
          >
            {addUserMutation.isLoading ? "Adding User" : "Add User"}
          </Button>
        </Surface>
      </Modal>
    </Portal>
  )
}

export default AddUserModal

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
    },
    administratorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5
    }
  })
}
