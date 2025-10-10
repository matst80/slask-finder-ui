import { useState, useCallback, useEffect } from 'react'

let tempCanvas: HTMLCanvasElement | null = null
const getCanvas = () => {
  if (tempCanvas == null) {
    tempCanvas = globalThis.document.createElement('canvas')
  }
  return tempCanvas
}

export const measureSize = (element: HTMLElement, text: string): number => {
  const canvas = getCanvas()
  const context = canvas.getContext('2d')
  if (context == null) {
    return 0
  }
  context.font = getComputedStyle(element).font
  const textWidth = context.measureText(text).width
  return textWidth
}

export const useCursorPosition = (
  ref: React.RefObject<HTMLInputElement | null>,
  { useCursorPosition = true }: { useCursorPosition?: boolean } = {},
) => {
  const [left, setLeft] = useState(0)

  const updatePosition = useCallback(() => {
    const input = ref?.current
    if (input == null) {
      return
    }
    const position = input.selectionStart ?? 0
    const text = useCursorPosition
      ? input.value.substring(0, position)
      : input.value
    setLeft(Math.round(measureSize(input, text)))
  }, [ref, useCursorPosition])

  useEffect(() => {
    const input = ref?.current
    if (input == null) {
      return
    }

    input.addEventListener('focus', updatePosition, { passive: true })
    input.addEventListener('change', updatePosition, { passive: true })
    return () => {
      input.removeEventListener('focus', updatePosition)
      input.removeEventListener('change', updatePosition)
    }
  }, [ref, updatePosition])

  return { left, updatePosition }
}
