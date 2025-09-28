import { Cart } from "../types";
import { baseUrl, toJson } from "./api";

type AddToCartArgs = {
  sku: string;
  quantity: number;
};

type ChangeQuantityArgs = {
  id: number;
  quantity: number;
};

const getCountry = () => {
  return globalThis.location.host.includes("-no") ? "no" : "se";
}

export const addToCart = (payload: AddToCartArgs) => {
  const country = getCountry();
  return fetch(`${baseUrl}/cart/`, {
    method: "POST",
    body: JSON.stringify({...payload, country}),
  }).then((d) => toJson<Cart>(d));
};

export const changeQuantity = (payload: ChangeQuantityArgs) =>
  fetch(`${baseUrl}/cart/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((d) => toJson<Cart>(d));

export const removeFromCart = ({ id }: { id: number }) =>
  fetch(`${baseUrl}/cart/${id}`, {
    method: "DELETE",
  }).then((d) => toJson<Cart>(d));

export const getCart = () =>
  fetch(`${baseUrl}/cart/`).then(async (d) => {
    if (d.status === 404) {
      return null;
    }
    return toJson<Cart>(d);
  });
type Checkout = { html_snippet: string };

export const getCheckout = () =>
  fetch(`${baseUrl}/cart/checkout`).then((d) => toJson<Checkout>(d));

export const getConfirmation = (id: string) =>
  fetch(`${baseUrl}/cart/confirmation/${id}`).then((d) => toJson<Checkout>(d));

export const getCartById = (id: string | number) =>
  fetch(`${baseUrl}/cart/${id}`).then((d) => toJson<Cart>(d));
