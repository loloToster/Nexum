import React from "react"
import { Platform } from "react-native"

export interface TranslatableProps {
  children: React.ReactElement
}

function Translatable({ children }: TranslatableProps) {
  if (Platform.OS !== "web") return <>{children}</>

  const addTranslate = (el: unknown) => {
    if (el instanceof Element) el.setAttribute("translate", "yes")
  }

  return (
    <>
      {React.Children.map(children, c =>
        React.cloneElement(c, { ref: addTranslate })
      )}
    </>
  )
}

export default Translatable
