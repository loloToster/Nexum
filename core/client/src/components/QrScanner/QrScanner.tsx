import React, { useEffect, useState } from "react"
import { StyleSheet, Dimensions, View, Image } from "react-native"

import {
  MD2Theme,
  useTheme,
  Portal,
  Modal,
  ModalProps,
  Headline,
  IconButton,
  Button
} from "react-native-paper"

import {
  CameraView,
  BarcodeScanningResult,
  useCameraPermissions
} from "expo-camera"

import qrFrame from "assets/qr-frame.png"

function QrScanner(
  props: Omit<ModalProps, "children" | "theme"> & {
    onScan?: (result: BarcodeScanningResult) => void
  }
) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const requestPermission = useCameraPermissions()[1]
  const [flashlightOn, setFlashlightOn] = useState(false)

  // ask for permission when modal is opened
  const [opened, setOpened] = useState(props.visible)

  if (props.visible !== opened) setOpened(props.visible)

  useEffect(() => {
    if (opened) requestPermission()
  }, [opened])

  return (
    <Portal>
      <Modal {...props}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"]
          }}
          onBarcodeScanned={props.onScan}
          enableTorch={flashlightOn}
        >
          <View style={styles.cameraContent}>
            <IconButton
              style={styles.close}
              icon="close"
              onPress={props.onDismiss}
            />
            <Headline style={styles.head}>Scan QR</Headline>
            <Image style={styles.frame} source={qrFrame} />
            <Button
              theme={{ colors: { primary: "white" } }}
              style={styles.flashlight}
              icon={flashlightOn ? "flashlight-off" : "flashlight"}
              onPress={() => setFlashlightOn(p => !p)}
            >
              Flashlight
            </Button>
          </View>
        </CameraView>
      </Modal>
    </Portal>
  )
}

export default QrScanner

const getStyles = (theme: MD2Theme) => {
  const frameSize = Dimensions.get("window").width / 1.5

  return StyleSheet.create({
    camera: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height
    },
    cameraContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    head: {
      position: "absolute",
      top: 80,
      backgroundColor: "#212121bb",
      borderRadius: theme.roundness,
      paddingHorizontal: 20,
      paddingVertical: 10
    },
    close: {
      position: "absolute",
      right: 20,
      top: 20
    },
    frame: {
      width: frameSize,
      height: frameSize,
      resizeMode: "stretch"
    },
    flashlight: {
      position: "absolute",
      bottom: 30
    }
  })
}
