import React, { useState } from "react"
import { View, StyleSheet, Platform } from "react-native"
import { AxiosError } from "axios"
import { useMutation } from "react-query"

import {
  MD2Theme,
  useTheme,
  Headline,
  TextInput,
  Text,
  Button,
  Portal,
  Modal,
  ActivityIndicator
} from "react-native-paper"

import config from "src/config"
import api from "src/api"

import { useUser } from "src/contexts/user"

import QrScanner from "src/components/QrScanner/QrScanner"
import Translatable from "src/components/Translatable/Translatable"

function Login() {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const { setUser } = useUser()

  const [code, setCode] = useState("")
  const [scannerOpened, setScannerOpened] = useState(false)
  const [userError, setUserError] = useState("")

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
        if (data) setUser(data)
      }
    }
  )

  const handleScan = ({ data }: { data: string }) => {
    if (!data.startsWith(config.userCodePrefix) || loginMutation.isLoading)
      return

    const token = data.slice(config.userCodePrefix.length)
    loginMutation.mutate(token)
    setScannerOpened(false)
  }

  return (
    <Translatable>
      <View style={styles.container}>
        <Portal>
          <Modal visible={loginMutation.isLoading} dismissable={false}>
            <ActivityIndicator size="large" />
          </Modal>
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
            onPress={() => loginMutation.mutate(code)}
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
    </Translatable>
  )
}

export default Login

const getStyles = (theme: MD2Theme) => {
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
