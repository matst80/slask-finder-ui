import useSWR from 'swr'
import {
  getCheckout,
  getPaymentSessionData,
  initiatePayment,
  removeDelivery,
  setDelivery,
  setPickupPoint,
  startCheckout,
} from '../lib/datalayer/checkout-api'
import { PickupPoint } from '../lib/types'
import { useFetchMutation, useStateFetchMutation } from '../utils'

const checkoutKey = '/checkout'

export const useCheckout = () => {
  return useSWR(checkoutKey, getCheckout, {
    keepPreviousData: true,
    revalidateOnFocus: true,
    revalidateIfStale: true,
    errorRetryInterval: 5000,
  })
}

export const useSetDelivery = () => {
  return useStateFetchMutation(checkoutKey, setDelivery)
}

export const useRemoveDelivery = () => {
  return useStateFetchMutation(checkoutKey, removeDelivery)
}

export const useSetPickupPoint = () => {
  return useStateFetchMutation(
    checkoutKey,
    ({
      deliveryId,
      pickupPoint,
    }: {
      deliveryId: number
      pickupPoint: PickupPoint
    }) => setPickupPoint({ deliveryId, pickupPoint }),
  )
}

// export const useSetUserId = () => {
//   return useCartFetchMutation(checkoutKey, setUserId)
// }

export const useStartCheckout = () => {
  return useFetchMutation(checkoutKey, (cartId?: string) =>
    startCheckout(cartId),
  )
}

// export const useInitiateKlarnaPayment = () => {
//   return useStateFetchMutation(checkoutKey, () => initiateKlarnaPayment())
// }

// export const useInitiateAdyenPayment = () => {
//   return useStateFetchMutation(checkoutKey, () => initiateAdyenPayment())
// }

export const useInitiatePayment = () => {
  return useStateFetchMutation(checkoutKey, (method: 'klarna' | 'adyen') =>
    initiatePayment(method),
  )
}

export const usePaymentSessionData = (paymentId: string) => {
  return useSWR(
    `/checkout/payment-session/${paymentId}`,
    () => {
      // Fetch payment session data based on paymentId
      // This is a placeholder implementation; replace with actual API call
      return getPaymentSessionData(paymentId)
    },
    {
      revalidateOnFocus: false,
      errorRetryInterval: 5000,
    },
  )
}
