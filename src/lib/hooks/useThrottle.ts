import { useEffect, useRef, useState } from 'react'

export const useThrottle = <T>(value: T, ms: number = 200) => {
  const [state, setState] = useState<T>(value)
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const nextValue = useRef<T | null>(null)
  const hasNextValue = useRef(false)

  useEffect(() => {
    if (!timeout.current) {
      setState(value)
      const timeoutCallback = () => {
        if (hasNextValue.current && nextValue.current !== null) {
          hasNextValue.current = false
          setState(nextValue.current)
          timeout.current = setTimeout(timeoutCallback, ms)
        } else {
          timeout.current = undefined
        }
      }
      timeout.current = setTimeout(timeoutCallback, ms)
    } else {
      nextValue.current = value
      hasNextValue.current = true
    }
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current)
        timeout.current = undefined
      }
    }
  }, [value])

  return state
}
