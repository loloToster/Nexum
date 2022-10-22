import { useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import {
  Theme,
  useTheme,
  Headline,
  TextInput,
  Text,
  Button
} from "react-native-paper"

import QrScanner from "../components/QrScanner/QrScanner"

function Login() {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [code, setCode] = useState("")
  const [scannerOpened, setScannerOpened] = useState(false)

  const handleScan = ({ data }) => {
    console.log(data)
  }

  return (
    <View style={styles.container}>
      <QrScanner
        visible={scannerOpened}
        onDismiss={() => setScannerOpened(false)}
        onScan={handleScan}
      />
      <Headline style={{ ...styles.head, ...styles.rowItem }}>
        {"Log in to start\nusing the app"}
      </Headline>
      <TextInput
        style={styles.rowItem}
        label="Insert Your Code Manually"
        value={code}
        onChangeText={setCode}
      />
      {code && (
        <Button style={styles.rowItem} mode="contained">
          Login
        </Button>
      )}
      <Text style={{ ...styles.or, ...styles.rowItem }}>OR</Text>
      <Button
        style={styles.rowItem}
        mode="contained"
        icon="qrcode"
        onPress={() => setScannerOpened(true)}
      >
        Scan the QR Code
      </Button>
    </View>
  )
}

export default Login

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 50
    },
    rowItem: {
      marginBottom: 25
    },
    head: {
      textAlign: "center",
      fontSize: 32
    },
    or: {
      textAlign: "center",
      color: "#4d4d4d"
    }
  })
}
