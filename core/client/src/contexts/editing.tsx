import React, { createContext, useContext, useState } from "react"

interface EditingContextI {
  editing: boolean
  saving: boolean
  setEditing: (editing: boolean) => void
  setSaving: (saving: boolean) => void
}

export const EditingContext = createContext<EditingContextI>({
  editing: false,
  saving: false,
  setEditing: () => null,
  setSaving: () => null
})

export const EditingContextProvider = (props: {
  children: React.ReactNode
}) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  return (
    <EditingContext.Provider value={{ editing, saving, setEditing, setSaving }}>
      {props.children}
    </EditingContext.Provider>
  )
}

export const useEditing = () => {
  return useContext(EditingContext)
}
