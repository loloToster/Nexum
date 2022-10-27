import { useState } from "react"
import { View, StyleSheet, Dimensions, Platform } from "react-native"
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
  Divider
} from "react-native-paper"
import QRCode from "react-native-qrcode-svg"

import { UserI } from "./types"

function User(props: { user: UserI }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { user } = props

  const [active, setActive] = useState(false)
  const [qrActive, setQrActive] = useState(false)
  const [isAdmin, setIsAdmin] = useState(user.isAdmin)

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
              value={user.id}
            />
          </View>
        </Modal>
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
            <Text>Administrator privilages:</Text>
            <Switch value={isAdmin} onValueChange={() => setIsAdmin(p => !p)} />
          </View>
          <Divider
            style={
              Platform.OS === "web"
                ? { marginVertical: 10 }
                : { marginBottom: 10 }
            }
          />
          <Text>Available tabs:</Text>
          <View style={styles.tabs}>
            {user.tabs.map((tab, i) => (
              <Chip
                style={styles.tab}
                key={i}
                mode="flat"
                closeIcon="minus-circle"
                onClose={() => {}}
              >
                {tab}
              </Chip>
            ))}
            <IconButton
              style={{ ...styles.tab, ...styles.addTab }}
              icon="plus"
            />
          </View>
          <Button
            style={styles.showQr}
            icon="qrcode"
            onPress={() => setQrActive(true)}
            mode="contained"
          >
            Show QR code
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
      alignItems: "center"
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
    showQr: {
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
