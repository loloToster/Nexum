import React, { useRef, useState } from "react"
import { Colors, IconButton } from "react-native-paper"
import Clipboard from "@react-native-clipboard/clipboard"

export interface CopyButtonProps {
  text: string
}

function CopyButton({ text }: CopyButtonProps) {
  const [success, setSuccess] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()

  const handleClick = () => {
    Clipboard.setString(text)
    setSuccess(true)

    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  return (
    <IconButton
      icon={success ? "check" : "content-copy"}
      color={success ? Colors.lightGreenA700 : undefined}
      size={20}
      onPress={handleClick}
    />
  )
}

export default CopyButton
