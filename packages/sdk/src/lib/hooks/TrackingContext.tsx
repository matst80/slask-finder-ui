import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react'
import { BaseEcomEvent } from '../types'

export type TrackingEvent = ImpressionEvent | ClickEvent

type ImpressionEvent = {
  type: 'impressions'
  items: BaseEcomEvent[]
}

type ClickEvent = {
  type: 'click'
  item: BaseEcomEvent
}

export type BaseTrackingHandler<
  TType extends string,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: TType
  context: TContext
  handle: (event: TrackingEvent, handler: TContext) => void
}

export type GoogleTrackingContext = { list_id?: string; list_name?: string }

export type GoogleTracker = BaseTrackingHandler<'google', GoogleTrackingContext>

export type SlaskTracker = BaseTrackingHandler<'slask'>

export type TrackingHandler = GoogleTracker | SlaskTracker | BuilderTracker

export type BuilderTracker = BaseTrackingHandler<'builder'>

type TrackingContextProps = {
  handlers: TrackingHandler[]
  setHandlers: React.Dispatch<React.SetStateAction<TrackingHandler[]>>
  accepted: string | null
}

const TrackingContext = createContext<TrackingContextProps | null>(null)

export const TrackingProvider = ({
  handlers: initialHandlers,
  accepted,
  children,
}: PropsWithChildren<{
  handlers: TrackingHandler[]
  accepted: string | null
}>) => {
  const context = useContext(TrackingContext)

  const [handlers, setHandlers] = useState<TrackingHandler[]>([
    ...initialHandlers,
    ...(context?.handlers.filter(
      (d) => !initialHandlers.some((e) => e.type == d.type),
    ) || []),
  ])

  return (
    <TrackingContext.Provider value={{ handlers, setHandlers, accepted }}>
      {children}
    </TrackingContext.Provider>
  )
}

export const useTrackingHandlers = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error(
      'useTrackingHandlers must be used within a TrackingProvider',
    )
  }
  return context.handlers
}

export const useTracking = () => {
  const context = useContext(TrackingContext)

  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }

  const { accepted, handlers } = context

  const track = useCallback(
    (event: TrackingEvent) => {
      if (accepted !== 'all') {
        console.warn('Tracking not allowed')
        return
      }
      handlers.forEach((handler) => {
        handler.handle.apply(handler, [event, handler.context])
      })
    },
    [accepted, handlers],
  )
  return {
    track,
  }
}
