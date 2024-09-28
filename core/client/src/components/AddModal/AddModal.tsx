import React from "react"
import { Dimensions, ScrollView, StyleSheet } from "react-native"
import {
  Headline,
  List,
  Modal,
  Portal,
  Surface,
  MD2Theme,
  useTheme
} from "react-native-paper"

export interface AddModalProps {
  title: string
  items: Array<{
    id: string
    name: string
    icon?: string
  }>
  open: boolean
  onClose: () => void
  onChoice: (id: string) => void
}

function AddModal({ title, items, open, onClose, onChoice }: AddModalProps) {
  const theme = useTheme<MD2Theme>()
  const styles = getStyles(theme)

  return (
    <Portal>
      <Modal visible={open} onDismiss={onClose} style={styles.modal}>
        <Surface style={styles.modalContent}>
          <Headline>{title}</Headline>
          <ScrollView>
            <List.Section>
              {items.map(item => (
                <List.Item
                  onPress={() => onChoice(item.id)}
                  title={item.name}
                  key={item.id}
                  left={props => (
                    <List.Icon
                      {...props}
                      color={theme.colors.accent}
                      icon={item.icon || "square-rounded"}
                    />
                  )}
                />
              ))}
            </List.Section>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  )
}

export default AddModal

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
