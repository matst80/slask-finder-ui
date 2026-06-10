import {
  SlaskTracker,
  trackClick,
  trackImpression,
} from '@matst80/slask-finder-sdk'

export const slaskTracker = (): SlaskTracker => {
  return {
    type: 'slask',
    context: {},
    handle: (event) => {
      // console.log("slask tracker", { event });
      switch (event.type) {
        case 'impressions':
          trackImpression(event.items)
          break
        case 'click':
          trackClick(event.item)
          break
        default:
          console.warn('Unknown event type for Slask Tracker', event)
          break
      }
    },
  }
}
