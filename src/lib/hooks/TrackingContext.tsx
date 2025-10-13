import React, { createContext, PropsWithChildren, useCallback } from 'react'
import { BaseEcomEvent } from '../types'
import { useCookieAcceptance } from '../../CookieConsent'

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
}

const TrackingContext = createContext<TrackingContextProps | null>(null)

export const TrackingProvider = ({
  handlers: initialHandlers,
  children,
}: PropsWithChildren<{ handlers: TrackingHandler[] }>) => {
  const context = React.useContext(TrackingContext)

  const [handlers, setHandlers] = React.useState<TrackingHandler[]>([
    ...initialHandlers,
    ...(context?.handlers.filter(
      (d) => !initialHandlers.some((e) => e.type == d.type),
    ) || []),
  ])

  return (
    <TrackingContext.Provider value={{ handlers, setHandlers }}>
      {children}
    </TrackingContext.Provider>
  )
}

export const useTrackingHandlers = () => {
  const context = React.useContext(TrackingContext)
  if (!context) {
    throw new Error(
      'useTrackingHandlers must be used within a TrackingProvider',
    )
  }
  return context.handlers
}

export const useTracking = () => {
  const context = React.useContext(TrackingContext)
  const { accepted } = useCookieAcceptance()

  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  const { handlers } = context
  const track = useCallback(
    (event: TrackingEvent) => {
      if (accepted !== 'all') {
        console.warn('Tracking not allowed')
        return
      }
      context.handlers.forEach((handler) => {
        handler.handle.apply(handler, [event, handler.context])
      })
    },
    [handlers],
  )
  return {
    track,
  }
}
