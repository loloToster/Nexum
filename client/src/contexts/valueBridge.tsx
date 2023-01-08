import React, { createContext, useContext, useEffect } from "react"

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
}

const bridge = new EventEmitter()
const values: ValuesMap = {}

const ValueBridgeContext = createContext<ValueBridgeContextI>({
  bridge,
  values,
  emit: () => null
})

export const ValueBridgeProvider = (props: { children: React.ReactNode }) => {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const listener = (v: ValueUpdateObj) => {
      values[v.target] = v.value
      bridge.emit("update-value", v)
    }

    // TODO: show loading if not received sync
    const syncListener = (v: ValueUpdateObj[]) => {
      v.forEach(listener)
    }

    socket.on("sync", syncListener)
    socket.on("update-value", listener)

    return () => {
      socket.off("sync", syncListener)
      socket.off("update-value", listener)
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
        emit
      }}
    >
      {props.children}
    </ValueBridgeContext.Provider>
  )
}

export const useValueBridge = () => {
  return useContext(ValueBridgeContext)
}
