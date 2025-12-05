import { useCallback, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import {
  Checkout,
  getCheckout,
  initiatePayment,
  PaymentResult,
  removeDelivery,
  setDelivery,
  setPaymentResult,
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

// export const usePaymentSessionData = (paymentId: string) => {
//   return useSWR(
//     `/checkout/payment-session/${paymentId}`,
//     () => {
//       // Fetch payment session data based on paymentId
//       // This is a placeholder implementation; replace with actual API call
//       return getPaymentSessionData(paymentId);
//     },
//     {
//       revalidateOnFocus: false,
//       revalidateIfStale: false,
//       errorRetryInterval: 5000,
//     },
//   );
// };

export const useSetPaymentResult = (paymentId: string) => {
  return useSWRMutation(
    `/checkout/payment-result/${paymentId}`,
    (_, { arg }: { arg: PaymentResult }) => setPaymentResult(paymentId, arg),
    {
      populateCache: false,
      revalidate: false,
    },
  )
}

// Add this new hook
export const usePaymentStatusUpdater = (paymentId: string) => {
  const { mutate } = useSWRConfig()
  const [isWaiting, setIsWaiting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const wait = useCallback(
    async (timeoutMs: number = 60_000): Promise<boolean> => {
      setIsWaiting(true)
      abortRef.current = new AbortController()
      const startTime = Date.now()
      const pollInterval = 1000 // 1 second between polls

      try {
        while (Date.now() - startTime < timeoutMs) {
          if (abortRef.current.signal.aborted) {
            break
          }

          // Revalidate checkout and get fresh data
          const checkout = await mutate<Checkout>(checkoutKey)

          // Check if payment status has changed from pending
          const payment = checkout?.payments?.find(
            (p) => p.paymentId === paymentId,
          )

          if (payment && payment.status !== 'pending') {
            setIsWaiting(false)
            return true // Status changed successfully
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, pollInterval))
        }

        // Timeout reached without status change
        setIsWaiting(false)
        return false
      } catch (error) {
        console.error('Error waiting for payment status:', error)
        setIsWaiting(false)
        return false
      }
    },
    [mutate, paymentId],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsWaiting(false)
  }, [])

  return { wait, isWaiting, cancel }
}
