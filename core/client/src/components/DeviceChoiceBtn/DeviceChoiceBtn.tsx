import React, { useState } from "react"
import { useQuery } from "react-query"
import {
  Dimensions,
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native"
import {
  Button,
  Headline,
  List,
  Modal,
  Portal,
  Surface,
  MD2Theme,
  useTheme
} from "react-native-paper"

import api from "src/api"
import { Device as DeviceI } from "src/types"
import microcontrollerIcon from "assets/microcontroller.png"

export interface DeviceChoiceBtnProps {
  deviceId?: number
  onChangeDevice: (id: number) => void
  style?: StyleProp<ViewStyle>
}

function DeviceChoiceBtn({
  deviceId,
  onChangeDevice,
  style
}: DeviceChoiceBtnProps) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  const [choiceModalOpen, setChoiceModalOpen] = useState(false)

  const { data, isLoading } = useQuery("devices", async () => {
    const res = await api.get("/devices")
    return res.data as DeviceI[]
  })

  const handleDevicePress = (id: number) => {
    setChoiceModalOpen(false)
    onChangeDevice(id)
  }

  return (
    <>
      <Button
        style={style}
        loading={isLoading}
        mode="outlined"
        uppercase={false}
        contentStyle={{ paddingVertical: 10 }}
        icon={({ size }) => (
          <Image
            source={microcontrollerIcon}
            style={{ width: size * 1.5, height: size * 1.5, opacity: 1 }}
          />
        )}
        onPress={isLoading ? undefined : () => setChoiceModalOpen(true)}
      >
        {isLoading
          ? "Loading Device"
          : data?.find(d => d.id === deviceId)?.name ?? "No Device"}
      </Button>
      <Portal>
        <Modal
          visible={choiceModalOpen}
          onDismiss={() => setChoiceModalOpen(false)}
          style={styles.modal}
        >
          <Surface style={styles.modalContent}>
            <Headline>Change Device</Headline>
            <ScrollView>
              <List.Section>
                {data?.map(dev => (
                  <List.Item
                    title={dev.name}
                    key={dev.id}
                    onPress={() => handleDevicePress(dev.id)}
                  />
                ))}
              </List.Section>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    </>
  )
}

export default DeviceChoiceBtn

const getStyles = (theme: MD2Theme) => {
  return StyleSheet.create({
    modal: {
      alignItems: "center",
      justifyContent: "center"
    },
    modalContent: {
      width: Dimensions.get("window").width / 1.2,
      padding: 20,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.background,
      maxHeight: Dimensions.get("window").height / 1.2
    }
  })
}
