import {
  GoogleTracker,
  GoogleTrackingContext,
} from '../lib/hooks/TrackingContext'

type WindowWithDataLayer = Window & {
  gtag?: (event: 'event' | 'config', ...args: unknown[]) => void
  dataLayer?: unknown[]
}

export const googleTracker = (
  context?: GoogleTrackingContext,
): GoogleTracker => {
  return {
    type: 'google',
    context: context || {},
    handle: (event, { list_id, list_name }) => {
      const w = globalThis?.window as WindowWithDataLayer
      //console.log("google tracker", { event, context, dataLayer: w.gtag });
      if (w?.gtag) {
        switch (event.type) {
          case 'impressions':
            w.gtag('event', 'view_item_list', {
              list_name,
              list_id,
              items: event.items,
            })
            break
          case 'click':
            w.gtag('event', 'select_item', {
              list_name,
              list_id,
              items: [event.item],
            })
            break
          default:
            console.warn('Unknown event type for Google Tracker', event)
            break
        }
      }
    },
  }
}
