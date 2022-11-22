import React from "react"
import { Portal, Dialog, Paragraph, Button } from "react-native-paper"

export interface RUSureProps {
  open?: boolean
  children?: string
  onConfirm?: () => unknown
  onDismiss?: () => unknown
}

function RUSure({
  open = false,
  children = "Are you sure?",
  onConfirm,
  onDismiss
}: RUSureProps) {
  return (
    <Portal>
      <Dialog visible={open} onDismiss={onDismiss}>
        <Dialog.Content>
          <Paragraph>{children}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirm}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

export default RUSure
