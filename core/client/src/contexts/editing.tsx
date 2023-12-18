import React, { createContext, useContext, useRef, useState } from "react"

import { useMutation } from "react-query"
import api from "src/api"

interface PosEdit {
  widgetId: number
  x?: number
  y?: number
  width?: number
  height?: number
}

interface EditingContextI {
  moving: boolean
  editing: boolean
  saving: boolean
  setMoving: (moving: boolean) => void
  setEditing: (editing: boolean) => void
  setSaving: (saving: boolean) => void
  registerPosEdit: (edit: PosEdit) => void
  save: () => void
}

export const EditingContext = createContext<EditingContextI>({
  moving: false,
  editing: false,
  saving: false,
  setMoving: () => null,
  setEditing: () => null,
  setSaving: () => null,
  registerPosEdit: () => null,
  save: () => null
})

export const EditingContextProvider = (props: {
  children: React.ReactNode
}) => {
  const [moving, setMoving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const registeredEdits = useRef<PosEdit[]>([]).current

  const registerPosEdit = (edit: PosEdit) => {
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
    async (edits: PosEdit[]) => {
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
    setMoving(false)
    setEditing(false)
    setSaving(true)
    editMutation.mutate(registeredEdits)
  }

  return (
    <EditingContext.Provider
      value={{
        moving,
        editing,
        saving,
        setMoving,
        setEditing,
        setSaving,
        registerPosEdit,
        save
      }}
    >
      {props.children}
    </EditingContext.Provider>
  )
}

export const useEditing = () => {
  return useContext(EditingContext)
}
