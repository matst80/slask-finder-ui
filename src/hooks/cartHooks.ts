import useSWR from 'swr'
import { clearCart } from '../lib/datalayer/api'
import {
  addToCart,
  changeQuantity,
  getCart,
  removeFromCart,
} from '../lib/datalayer/cart-api'
import { useFetchMutation } from '../utils'
import { trackCart } from '../lib/datalayer/beacons'
import { BaseEcomEvent, Item } from '../lib/types'
import { useNotifications } from '../components/ui-notifications/useNotifications'
import { toEcomTrackingEvent } from '../components/toImpression'
import { useCookieAcceptance } from '../CookieConsent'

const cartKey = '/cart'

export const useCart = () => {
  return useSWR(cartKey, getCart, {
    keepPreviousData: true,
    errorRetryInterval: 50000,
  })
}

export const useResetCart = () => {
  return useFetchMutation(cartKey, () => clearCart().then(() => getCart()))
}

export const useAddMultipleToCart = () => {
  const { showNotification } = useNotifications()
  return useFetchMutation(cartKey, (items: (Item & { quantity?: number })[]) =>
    Promise.all(
      items.map((item, idx) => {
        return addToCart({ sku: item.sku, quantity: item.quantity ?? 1 })
          .then(() => {
            showNotification({
              title: 'Added to cart',
              message: `${item.title} has been added to your cart.`,
              variant: 'success',
            })
            trackCart({
              ...toEcomTrackingEvent(item, idx),
              quantity: item.quantity ?? 1,
              type: 'add',
            })
          })
          .catch(() => {
            showNotification({
              title: 'Error',
              message: `Failed to add ${item.title} to your cart.`,
              variant: 'error',
            })
          })
      }),
    ),
  )
}

export const useAddToCart = () => {
  const { accepted } = useCookieAcceptance()
  const { showNotification } = useNotifications()
  const { trigger, ...rest } = useFetchMutation(cartKey, addToCart)
  return {
    ...rest,
    trigger: async (
      item: { sku: string; quantity: number; storeId?: string },
      trackingItem: BaseEcomEvent,
    ) => {
      if (accepted === 'none' || accepted === null) {
        showNotification({
          title: 'Error',
          message: `No use in adding to cart if you don't accept essential cookies.`,
          variant: 'error',
        })
        return
      }
      return trigger(item)
        .then((data) => {
          if (data) {
            // showNotification({
            //   title: "Added to cart",
            //   message: `Item added to your cart.`,
            //   variant: "success",
            // });
            trackCart({
              ...trackingItem,
              quantity: item.quantity,
              type: 'add',
            })
          }
          return data
        })
        .catch(() => {
          showNotification({
            title: 'Error',
            message: `Failed to add item to your cart.`,
            variant: 'error',
          })
        })
    },
  }
}

export const useChangeQuantity = () => {
  const { trigger, ...rest } = useFetchMutation(cartKey, changeQuantity)
  return {
    ...rest,
    trigger: async (id: number, quantity: number, item: BaseEcomEvent) => {
      const data = await trigger({ id, quantity })
      if (data) {
        trackCart({ ...item, quantity, type: 'quantity' })
      }
      return data
    },
  }
}

export const useRemoveFromCart = () => {
  const { trigger, ...rest } = useFetchMutation(cartKey, removeFromCart)
  return {
    ...rest,
    trigger: async (id: number, item: BaseEcomEvent) => {
      const data = await trigger({ id })
      if (data) {
        trackCart({ ...item, quantity: 0, type: 'remove' })
      }
      return data
    },
  }
}
