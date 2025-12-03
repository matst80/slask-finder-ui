import { Cart, LineItemMarkingRequest, MutationResult } from '../types'
import { baseUrl, toJson } from './api'

type AddToCartArgs = {
  sku: string
  quantity: number
}

type ChangeQuantityArgs = {
  id: number
  quantity: number
}

const getCountry = () => {
  return globalThis.location.host.includes('-no') ? 'no' : 'se'
}

export const addToCart = async (payload: AddToCartArgs) => {
  const country = getCountry()
  return fetch(`${baseUrl}/cart`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, country }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const setUserId = async (userId: string) => {
  return fetch(`${baseUrl}/cart/user`, {
    method: 'PUT',
    body: JSON.stringify({ userId }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const addVoucher = async (code: string) => {
  const country = getCountry()
  return fetch(`${baseUrl}/cart/voucher`, {
    method: 'PUT',
    body: JSON.stringify({ code, country }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const removeVoucher = async (id: number) => {
  const country = getCountry()
  return fetch(`${baseUrl}/cart/voucher/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ country }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const addToCartMultiple = async (items: AddToCartArgs[]) => {
  const country = getCountry()
  return fetch(`${baseUrl}/cart/add`, {
    method: 'POST',
    body: JSON.stringify({ items, country }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const changeQuantity = (payload: ChangeQuantityArgs) =>
  fetch(`${baseUrl}/cart`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((d) => toJson<MutationResult<Cart>>(d))

export const removeFromCart = ({ id }: { id: number }) =>
  fetch(`${baseUrl}/cart/${id}`, {
    method: 'DELETE',
  }).then((d) => toJson<MutationResult<Cart>>(d))

export const getCart = () =>
  fetch(`${baseUrl}/cart`).then(async (d) => {
    if (d.status === 404) {
      return null
    }
    return toJson<Cart>(d)
  })

export const getCartById = (id: string | number) =>
  fetch(`${baseUrl}/cart/${id}`).then((d) => toJson<Cart>(d))

export const upsertSubscriptionDetails = async <
  T extends Record<string, unknown>,
>(
  payload: UpsertSubscriptionDetails<T>,
) => {
  return fetch(`${baseUrl}/cart/subscription-details`, {
    method: 'PUT',
    body: JSON.stringify({ ...payload }),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const addToCartBySku = async (sku: string) => {
  return fetch(`${baseUrl}/cart/add/${sku}`).then((d) =>
    toJson<MutationResult<Cart>>(d),
  )
}

export const setItemMarking = async (payload: {
  itemId: number
  marking: LineItemMarkingRequest
}) => {
  const { itemId, marking } = payload
  return fetch(`${baseUrl}/cart/item/${itemId}/marking`, {
    method: 'PUT',
    body: JSON.stringify(marking),
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export const removeItemMarking = async (itemId: number) => {
  return fetch(`${baseUrl}/cart/item/${itemId}/marking`, {
    method: 'DELETE',
  }).then((d) => toJson<MutationResult<Cart>>(d))
}

export type UpsertSubscriptionDetails<T extends Record<string, unknown>> = {
  id?: string
  offeringCode: string
  signingType: string
  data: T
}
