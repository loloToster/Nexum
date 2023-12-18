import { Dimensions, ScrollView, StyleSheet } from "react-native"
import {
  Headline,
  List,
  Modal,
  Portal,
  Surface,
  Theme,
  useTheme
} from "react-native-paper"

import { widgetComponents } from "src/components/Widget/Widget"

export interface WidgetsModalProps {
  open: boolean
  onClose: () => void
}

function WidgetsModal({ open, onClose }: WidgetsModalProps) {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <Portal>
      <Modal visible={open} onDismiss={onClose} style={styles.modal}>
        <Surface style={styles.modalContent}>
          <Headline>Add Widget</Headline>
          <ScrollView>
            <List.Section>
              {widgetComponents.map(comp => (
                <List.Item
                  onPress={() => null}
                  title={comp.name}
                  key={comp.id}
                  left={props => (
                    <List.Icon
                      {...props}
                      color={theme.colors.accent}
                      icon={comp.icon || "square-rounded"}
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

export default WidgetsModal

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
      backgroundColor: theme.colors.background,
      maxHeight: Dimensions.get("window").height / 1.2
    }
  })
}
