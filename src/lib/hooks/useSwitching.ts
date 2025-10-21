import { useEffect, useMemo, useState } from 'react'

type Switching<T> = [T, (values: T[]) => void]

export const useSwitching = <T = string>(interval = 5000): Switching<T> => {
  const [values, setValues] = useState<T[]>([])
  const [idx, setIdx] = useState(0)
  const value = useMemo(() => values[idx], [idx, values])
  useEffect(() => {
    const to = setInterval(() => {
      setIdx((p) => (values != null ? (p + 1) % values.length : 0))
    }, interval)
    setIdx(0)
    return () => {
      clearInterval(to)
    }
  }, [values])
  return [value, setValues] as const
}
