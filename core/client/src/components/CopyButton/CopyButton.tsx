import React, { useRef, useState } from "react"
import { MD2Colors, IconButton } from "react-native-paper"
import * as Clipboard from "expo-clipboard"

export interface CopyButtonProps {
  text: string
}

function CopyButton({ text }: CopyButtonProps) {
  const [success, setSuccess] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()

  const handleClick = () => {
    Clipboard.setStringAsync(text)
    setSuccess(true)

    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  return (
    <IconButton
      icon={success ? "check" : "content-copy"}
      iconColor={success ? MD2Colors.lightGreenA700 : undefined}
      containerColor="transparent"
      size={20}
      onPress={handleClick}
    />
  )
}

export default CopyButton
