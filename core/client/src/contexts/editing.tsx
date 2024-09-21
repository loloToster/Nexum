import React, { createContext, useContext, useRef, useState } from "react"

import { useMutation } from "react-query"
import type { WidgetData, WidgetProperties } from "src/types"
import { useTabs } from "./tabs"
import api from "src/api"

interface PosEdit {
  widgetId: number
  x?: number
  y?: number
  width?: number
  height?: number
}

interface PropEdit {
  widgetId: number
  customId?: string
  deviceId?: number
  props: Partial<WidgetProperties>
}

interface EditingContextI {
  moving: boolean
  editing: boolean
  saving: boolean
  setMoving: (moving: boolean) => void
  setEditing: (editing: boolean) => void
  setSaving: (saving: boolean) => void
  registerPosEdit: (edit: PosEdit) => void
  registerPropEdit: (edit: PropEdit) => void
  registerWidgetCreate: (newWidget: WidgetData) => void
  registerWidgetDelete: (id: number) => void
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
  registerPropEdit: () => null,
  registerWidgetCreate: () => null,
  registerWidgetDelete: () => null,
  save: () => null
})

export const EditingContextProvider = (props: {
  children: React.ReactNode
}) => {
  const { setTabs } = useTabs()

  const [moving, setMoving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const registeredPosEdits = useRef<PosEdit[]>([])

  const registerPosEdit = (posEdit: PosEdit) => {
    const exisitingEdit = registeredPosEdits.current.find(
      e => e.widgetId === posEdit.widgetId
    )

    if (!exisitingEdit) {
      registeredPosEdits.current.push(posEdit)
      return
    }

    exisitingEdit.x = posEdit.x ?? exisitingEdit.x
    exisitingEdit.y = posEdit.y ?? exisitingEdit.y
    exisitingEdit.width = posEdit.width ?? exisitingEdit.width
    exisitingEdit.height = posEdit.height ?? exisitingEdit.height
  }

  const posMutation = useMutation(
    "edit-widgets-pos",
    async (posEdits: PosEdit[]) => {
      if (!posEdits.length) return
      await api.patch("/widgets/pos", { edits: posEdits })
    },
    {
      // TODO: handle error
      onSettled: () => {
        registeredPosEdits.current = []
        setSaving(false)
      }
    }
  )

  const registeredPropEdits = useRef<PropEdit[]>([])
  const registeredNewWidgets = useRef<WidgetData[]>([])
  const registeredDeletedWidgets = useRef<number[]>([])

  const registerPropEdit = (propEdit: PropEdit) => {
    const exisitingEdit = registeredPropEdits.current.find(
      e => e.widgetId === propEdit.widgetId
    )

    if (!exisitingEdit) {
      registeredPropEdits.current.push(propEdit)
      return
    }

    exisitingEdit.props = propEdit.props
  }

  const registerWidgetCreate = (newWidget: WidgetData) => {
    registeredNewWidgets.current.push(newWidget)
  }

  const registerWidgetDelete = (id: number) => {
    // remove edits related to widget
    registeredPosEdits.current = registeredPosEdits.current.filter(
      pe => pe.widgetId !== id
    )
    registeredPropEdits.current = registeredPropEdits.current.filter(
      pe => pe.widgetId !== id
    )

    // omit created in the same edit
    const lenBeforeCheck = registeredNewWidgets.current.length

    registeredNewWidgets.current = registeredNewWidgets.current.filter(
      w => w.id !== id
    )

    if (lenBeforeCheck === registeredNewWidgets.current.length) {
      registeredDeletedWidgets.current.push(id)
    }
  }

  const propMutation = useMutation(
    "edit-widgets-prop",
    async ({
      propEdits,
      newWidgets,
      deletedWidgets
    }: {
      propEdits: PropEdit[]
      newWidgets: WidgetData[]
      deletedWidgets: number[]
    }) => {
      if (!propEdits.length && !newWidgets.length && !deletedWidgets.length)
        return

      const res = await api.patch("/widgets/prop", {
        edits: propEdits,
        created: newWidgets,
        deleted: deletedWidgets
      })

      return res.data
    },
    {
      // TODO: handle error
      onSettled: () => {
        registeredPropEdits.current = []
        registeredNewWidgets.current = []
        registeredDeletedWidgets.current = []
        setSaving(false)
      },
      // replace fake ids with db ones
      onSuccess: ([_, createRes, __], vars) => {
        const placeholderIds = vars.newWidgets.map(w => w.id)

        setTabs(prev => {
          return prev.map(tab =>
            tab.widgets.some(w => placeholderIds.includes(w.id))
              ? {
                  ...tab,
                  widgets: tab.widgets.map(w =>
                    placeholderIds.includes(w.id)
                      ? {
                          ...w,
                          id: createRes[
                            placeholderIds.findIndex(pi => pi === w.id)
                          ]
                        }
                      : w
                  )
                }
              : tab
          )
        })
      }
    }
  )

  const save = () => {
    setMoving(false)
    setEditing(false)
    setSaving(true)

    posMutation.mutate(registeredPosEdits.current)
    propMutation.mutate({
      propEdits: registeredPropEdits.current,
      newWidgets: registeredNewWidgets.current,
      deletedWidgets: registeredDeletedWidgets.current
    })
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
        registerPropEdit,
        registerWidgetCreate,
        registerWidgetDelete,
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
