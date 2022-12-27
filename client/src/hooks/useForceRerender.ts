import { useState } from "react"

export default function useForceRerender() {
  const setValue = useState(0)[1]
  return () => setValue(v => ++v)
}
