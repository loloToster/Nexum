import React, { useState } from "react"
import { View, StyleSheet, Platform } from "react-native"
import { AxiosError } from "axios"
import { useMutation } from "react-query"

import {
  Theme,
  useTheme,
  Headline,
  TextInput,
  Text,
  Button,
  Portal,
  Modal,
  ActivityIndicator,
  Dialog,
  Paragraph
} from "react-native-paper"

import config, { setBaseUrl } from "src/config"
import api from "src/api"

import { useUser } from "src/contexts/user"

import QrScanner from "src/components/QrScanner/QrScanner"

function Login({ onLogin }: { onLogin: () => void }) {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { setUser } = useUser()

  const [url, setUrl] = useState("") // url in dialog box
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)

  const [code, setCode] = useState("")
  const [userError, setUserError] = useState("")

  const [scannerOpened, setScannerOpened] = useState(false)

  const loginMutation = useMutation(
    "login",
    async (token: string) => {
      try {
        const res = await api.post("/auth/login", {
          token
        })

        return res.data
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setUserError("User with this code does not exist")
          return null
        } else {
          throw err
        }
      }
    },
    {
      onSuccess: data => {
        onLogin()
        if (data) setUser(data)
      }
    }
  )

  const handleLogin = async (code: string, noUrl = false) => {
    if (noUrl) {
      setUrlDialogOpen(false)
      await setBaseUrl(null)
      loginMutation.mutate(code)
      return
    }

    if (code.includes(config.tokenUrlSeparator)) {
      const [token, baseUrl] = code.split(config.tokenUrlSeparator)
      await setBaseUrl(baseUrl)
      loginMutation.mutate(token)
      return
    }

    if (url) {
      await setBaseUrl(url)
      loginMutation.mutate(code)
      return
    }

    setUrlDialogOpen(true)
  }

  const handleScan = ({ data }: { data: string }) => {
    if (!data.startsWith(config.userCodePrefix) || loginMutation.isLoading)
      return

    const providedCode = data.slice(config.userCodePrefix.length)

    setCode(providedCode)
    setScannerOpened(false)
    handleLogin(providedCode)
  }

  return (
    <View style={styles.container}>
      <Portal>
        <Modal visible={loginMutation.isLoading} dismissable={false}>
          <ActivityIndicator size="large" />
        </Modal>
        <Dialog
          visible={urlDialogOpen}
          onDismiss={() => setUrlDialogOpen(false)}
        >
          <Dialog.Content>
            <Paragraph>
              Your code does not include a base url, please provide one or use
              default.
            </Paragraph>
            <TextInput
              style={{ backgroundColor: "transparent" }}
              mode="outlined"
              placeholder="Base url"
              onChangeText={setUrl}
              value={url}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => handleLogin(code, true)}>Use Default</Button>
            <Button disabled={!url} onPress={() => handleLogin(code)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {Platform.OS !== "web" && (
        <QrScanner
          visible={scannerOpened}
          onDismiss={() => setScannerOpened(false)}
          onScan={handleScan}
        />
      )}
      <Headline style={[styles.head, styles.rowItem]}>
        {loginMutation.isError
          ? "Something went wrong\nplease try again"
          : "Log in to start\nusing the app"}
      </Headline>
      <TextInput
        style={styles.rowItem}
        label={
          userError || Platform.OS === "web"
            ? "Insert your code"
            : "Insert your code manually"
        }
        value={code}
        onChangeText={val => {
          setCode(val)
          setUserError("")
        }}
        error={Boolean(userError)}
      />
      {(code.length > 3 || Platform.OS === "web") && (
        <Button
          style={styles.rowItem}
          mode="contained"
          onPress={() => handleLogin(code)}
          disabled={loginMutation.isLoading || code.length <= 3}
        >
          Login
        </Button>
      )}
      {Platform.OS !== "web" && (
        <>
          <Text style={[styles.or, styles.rowItem]}>OR</Text>
          <Button
            style={styles.rowItem}
            mode="contained"
            icon="qrcode"
            onPress={() => setScannerOpened(true)}
          >
            Scan the QR Code
          </Button>
        </>
      )}
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
