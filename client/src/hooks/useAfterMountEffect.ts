import { useRef, useEffect } from "react"

export default function useAfterMountEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) {
      return effect()
    }

    mounted.current = true
  }, deps)
}
