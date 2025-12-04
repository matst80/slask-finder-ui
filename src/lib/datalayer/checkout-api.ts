import {
  Cart,
  CartPrice,
  MutationResult,
  PickupPoint,
  SetDeliveryRequest,
} from '../types'
import { baseUrl, toJson } from './api'

type KlarnaCheckout = { html_snippet: string }

export interface Checkout {
  id: string // base62 string form of uint64
  version: number
  cartId: string
  cartVersion: number
  cartState?: Cart
  cartTotalPrice?: CartPrice
  orderId?: string
  deliveries?: CheckoutDelivery[]
  paymentInProgress: number
  inventoryReserved: boolean
  confirmationViewed?: CheckoutConfirmationStatus
  payments?: CheckoutPayment[]
}

export interface CheckoutDelivery {
  id: number
  provider: string
  price: CartPrice
  items: number[] // line item ids from cart
  pickupPoint?: PickupPoint
}

export type CheckoutPaymentStatus = 'pending' | 'failed' | 'success' | 'partial'
export type PaymentStatus = 'pending' | 'failed' | 'success'

export interface CheckoutPayment {
  paymentId: string
  status: PaymentStatus
  amount: number // int64
  currency: string
  provider?: string
  method?: string
  sessionData?: PaymentSessionData
  events?: CheckoutPaymentEvent[]
  processorReference?: string
  startedAt?: string // RFC3339 timestamp
  completedAt?: string // RFC3339 timestamp
}

export interface CheckoutPaymentEvent {
  name: string
  success: boolean
  data: unknown // JSON blob
}

export interface CheckoutConfirmationStatus {
  code?: string
  viewCount: number
  lastViewedAt: string // RFC3339 timestamp
}

export type CartPaymentStatus = 'pending' | 'failed' | 'success' | 'partial'

export const getKlarnaSession = () =>
  fetch(`${baseUrl}/payment/klarna/session`).then((d) =>
    toJson<KlarnaCheckout>(d),
  )

// export const getConfirmation = (id: string) =>
//   fetch(`${baseUrl}/cart/confirmation/${id}`).then((d) => toJson<KlarnaCheckout>(d))

export const getCheckout = () =>
  fetch(`${baseUrl}/api/checkout`).then((d) => toJson<Checkout>(d))

export const setDelivery = async (payload: SetDeliveryRequest) => {
  return fetch(`${baseUrl}/api/checkout/delivery`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((d) => toJson<MutationResult<Checkout>>(d))
}

export const removeDelivery = async (deliveryId: number) => {
  return fetch(`${baseUrl}/api/checkout/delivery/${deliveryId}`, {
    method: 'DELETE',
  }).then((d) => toJson<MutationResult<Checkout>>(d))
}

export const setPickupPoint = async (payload: {
  deliveryId: number
  pickupPoint: PickupPoint
}) => {
  return fetch(`${baseUrl}/api/checkout/pickup-point`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((d) => toJson<MutationResult<Checkout>>(d))
}

export const startCheckout = async (cartId?: string) => {
  return fetch(`${baseUrl}/api/checkout/start/${cartId}`, {
    method: 'POST',
  }).then((d) => toJson<MutationResult<Checkout>>(d))
}

export const initiatePayment = async (provider: 'klarna' | 'adyen') => {
  return fetch(`${baseUrl}/payment`, {
    method: 'POST',
    body: JSON.stringify({ provider }),
  }).then((d) => toJson<MutationResult<Checkout>>(d))
}

type PaymentSessionData = unknown

export type PaymentResult = AdyenPaymentResult

export type AdyenPaymentResult = {
  sessionId?: string
  sessionResult?: string
  sessionData?: string
}

export const setPaymentResult = async (
  paymentId: string,
  result: PaymentResult,
) => {
  return fetch(`${baseUrl}/payment/${paymentId}/session`, {
    method: 'POST',
    body: JSON.stringify(result),
  }).then((d) => toJson<PaymentSessionData>(d))
}
