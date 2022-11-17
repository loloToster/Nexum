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
  Headline
} from "react-native-paper"

function AddUserModal(props: Omit<ModalProps, "children" | "theme">) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [isAdministrator, setIsAdministartor] = useState(false)

  return (
    <Portal>
      <Modal {...props} style={styles.modal}>
        <Surface style={styles.modalContent}>
          <Headline style={styles.row}>Create user</Headline>
          <TextInput
            style={styles.row}
            label="ID (defaults to uuid)"
            mode="outlined"
          />
          <TextInput style={styles.row} label="Name" mode="outlined" />
          <View style={[styles.row, styles.administratorRow]}>
            <Text>Administrator:</Text>
            <Switch
              value={isAdministrator}
              onValueChange={setIsAdministartor}
            />
          </View>
          <Button
            icon="plus"
            mode="contained"
            onPress={() => console.log("adding user")}
          >
            Add User
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
      marginBottom: 15,
      minHeight: 40
    },
    administratorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5
    }
  })
}
