import React, { createContext, useContext, useEffect, useState } from "react"

import { WidgetData, WidgetValue } from "src/types"
import { EventEmitter } from "src/utils"

import { useSocket, ValueUpdateObj } from "./socket"

export enum EmitTarget {
  Server,
  Local,
  ServerAndLocal,
  All
}

export interface LocalValueUpdateObj extends ValueUpdateObj {
  widgetId?: number
}

type ValuesMap = Record<string, WidgetValue | undefined>

interface ValueBridgeContextI {
  bridge: EventEmitter
  values: ValuesMap
  emit: (widget: WidgetData, val: WidgetValue, target: EmitTarget) => any
  synced: boolean
}

const bridge = new EventEmitter()
const values: ValuesMap = {}

export const ValueBridgeContext = createContext<ValueBridgeContextI>({
  bridge,
  values,
  emit: () => null,
  synced: false
})

export const ValueBridgeProvider = (props: { children: React.ReactNode }) => {
  const { socket } = useSocket()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (!socket) return

    const listener = (v: ValueUpdateObj) => {
      values[v.target] = v.value
      bridge.emit("update-value", v)
    }

    const syncListener = (v: ValueUpdateObj[]) => {
      v.forEach(listener)
      setSynced(true)
    }

    socket.on("sync", syncListener)
    socket.on("update-value", listener)
    socket.connect()

    return () => {
      socket.off("sync", syncListener)
      socket.off("update-value", listener)
      socket.disconnect()
    }
  }, [socket])

  const emit = (widget: WidgetData, val: WidgetValue, target: EmitTarget) => {
    values[widget.target] = val

    const emitObj = {
      target: widget.target,
      value: val
    }

    if (
      target === EmitTarget.Local ||
      target === EmitTarget.ServerAndLocal ||
      target === EmitTarget.All
    ) {
      bridge.emit("update-value", {
        widgetId: widget.id,
        ...emitObj
      })
    }

    if (
      target === EmitTarget.Server ||
      target === EmitTarget.ServerAndLocal ||
      target === EmitTarget.All
    ) {
      socket?.emit("update-value", emitObj)
    }
  }

  return (
    <ValueBridgeContext.Provider
      value={{
        bridge,
        values,
        emit,
        synced
      }}
    >
      {props.children}
    </ValueBridgeContext.Provider>
  )
}

export const useValueBridge = () => {
  return useContext(ValueBridgeContext)
}
