import React, { createContext, useContext, useRef, useState } from "react"

import { useMutation } from "react-query"
import api from "src/api"

interface Edit {
  widgetId: number
  x?: number
  y?: number
  width?: number
  height?: number
}

interface EditingContextI {
  editing: boolean
  saving: boolean
  setEditing: (editing: boolean) => void
  setSaving: (saving: boolean) => void
  registerEdit: (edit: Edit) => void
  save: () => void
}

export const EditingContext = createContext<EditingContextI>({
  editing: false,
  saving: false,
  setEditing: () => null,
  setSaving: () => null,
  registerEdit: () => null,
  save: () => null
})

export const EditingContextProvider = (props: {
  children: React.ReactNode
}) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const registeredEdits = useRef<Edit[]>([]).current

  const registerEdit = (edit: Edit) => {
    const exisitingEdit = registeredEdits.find(
      e => e.widgetId === edit.widgetId
    )

    if (!exisitingEdit) {
      registeredEdits.push(edit)
      return
    }

    exisitingEdit.x = edit.x ?? exisitingEdit.x
    exisitingEdit.y = edit.y ?? exisitingEdit.y
    exisitingEdit.width = edit.width ?? exisitingEdit.width
    exisitingEdit.height = edit.height ?? exisitingEdit.height
  }

  const editMutation = useMutation(
    "edit-widgets",
    async (edits: Edit[]) => {
      if (!edits.length) return
      await api.patch("/widgets/pos", { edits })
    },
    {
      // TODO: handle error
      onSettled: () => {
        registeredEdits.splice(0, registeredEdits.length)
        setSaving(false)
      }
    }
  )

  const save = () => {
    setEditing(false)
    setSaving(true)
    editMutation.mutate(registeredEdits)
  }

  return (
    <EditingContext.Provider
      value={{ editing, saving, setEditing, setSaving, registerEdit, save }}
    >
      {props.children}
    </EditingContext.Provider>
  )
}

export const useEditing = () => {
  return useContext(EditingContext)
}
