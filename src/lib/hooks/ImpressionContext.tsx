import { createContext } from 'react'
import { BaseEcomEvent } from '../types'

type ImpressionContextProps = {
  watch: (data: BaseEcomEvent) => (ref: HTMLElement | null) => void
  unwatch: (ref: HTMLElement) => void
  observer: IntersectionObserver | null
}
export const ImpressionContext = createContext<ImpressionContextProps | null>(
  null,
)
