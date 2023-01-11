import React, { useState } from "react"

export default function useObjectState<S extends object>(initialValue: S) {
  const [value, setValue] = useState<S>(initialValue)

  function setObject(value: React.SetStateAction<S>): void
  function setObject<K extends keyof S>(key: K, newValue: S[K]): void
  function setObject<K extends keyof S>(
    keyOrValue: K | React.SetStateAction<S>,
    newValue?: S[K]
  ) {
    // 1st overload
    if (newValue === undefined) {
      setValue(keyOrValue as React.SetStateAction<S>)
      return
    }

    // 2nd overload
    const key = keyOrValue as K
    setValue(prev => {
      prev[key] = newValue
      return { ...prev }
    })
  }

  return [value, setObject] as const
}
