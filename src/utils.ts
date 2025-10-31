import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'
import { useNotifications } from './components/ui-notifications/useNotifications'
import { CartMutationResult, ItemPrice, ItemValues } from './lib/types'

export function remove<T>(key: string | number) {
  return (prev: { [key: string]: T }) => {
    const { ...rest } = prev
    delete rest[key]
    return rest
  }
}

export const makeImageUrl = (pathOrUrl: string, size = '640') => {
  if (pathOrUrl.startsWith('http')) {
    return pathOrUrl
  }
  const parts = pathOrUrl.split('/')

  const [, section] = parts
  if (section == 'content') {
    return 'https://elgiganten.se' + pathOrUrl
  }

  const params = new URLSearchParams({
    w: size,
    q: '75',
  })
  // https://next-media.elkjop.com/image/dv_web_D1800010021776624/727299/samsung-galaxy-s24-5g-smartphone-8128gb-onyx-black.jpg?w=640&q=75
  // https://next-media.elkjop.com/image/dv_web_D1800010021776624/727299/samsung-galaxy-s24-5g-smartphone-8128gb-onyx-black.jpg?w=640&q=70
  return `https://next-media.elkjop.com${pathOrUrl}?${params.toString()}`

  // const url = `https://media.elkjop.com/assets/${section}/${blobId}`;
  // const params = new URLSearchParams({
  //   url,
  //   w: size,
  //   q: "75",
  // });

  // return "https://www.elgiganten.se/_next/image?" + params.toString();
}

export const useFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<T>,
  config?: SWRMutationConfiguration<T, Error, string, U>,
) => {
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    revalidate: false,
    populateCache: true,
    ...config,
  })
}

export const useCartFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<CartMutationResult<T>>,
  config?: SWRMutationConfiguration<CartMutationResult<T>, Error, string, U>,
) => {
  const { showNotification } = useNotifications()
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    revalidate: false,
    populateCache: (data, current) => {
      if (data.mutations && data.mutations.length > 0) {
        data.mutations
          .filter((d) => d.error != null)
          .forEach((mut) => {
            showNotification({
              title: `Error applying ${mut.type} mutation`,
              message: mut.error?.message ?? 'Unknown error',
              variant: 'warning',
            })
          })
      }
      return data.result ?? current
    },
    ...config,
  })
}

export const getPrice = (values: ItemValues): ItemPrice => {
  const current = Number(values['4'])
  const original = values['5'] != null ? Number(values['5']) : null
  const discount = values['8'] != null ? Number(values['8']) : null

  if (original != null && original > current) {
    return {
      isDiscounted: true,
      current,
      original,
      discount: discount ?? original - current,
    }
  }
  return {
    isDiscounted: false,
    current: Number(current ?? 0),
  }
}

const colorHexMap: Record<string, React.CSSProperties> = {
  Antracit: { backgroundColor: '#293133' },
  Azure: { backgroundColor: '#007FFF' },
  Beige: { backgroundColor: '#F5F5DC' },
  'Beige/Silver': { backgroundColor: '#C0C0C0' },
  Black: { backgroundColor: '#000000' },
  'Black /Green': { backgroundColor: '#004225' },
  'Black, Blue': { backgroundColor: '#0000FF' },
  'Black, Red': { backgroundColor: '#FF0000' },
  'Black/Gold': { backgroundColor: '#FFD700' },
  'Black/Green': { backgroundColor: '#008000' },
  'Black/Pink': { backgroundColor: '#FFC0CB' },
  'Black/Red': { backgroundColor: '#FF0000' },
  'Black/Silver': { backgroundColor: '#C0C0C0' },
  'Black/White': { backgroundColor: '#FFFFFF' },
  Blue: { backgroundColor: '#0000FF' },
  Blå: { backgroundColor: '#0000FF' },
  Brons: { backgroundColor: '#CD7F32' },
  Brown: { backgroundColor: '#A52A2A' },
  'Brown/Gold': { backgroundColor: '#FFD700' },
  Brun: { backgroundColor: '#A52A2A' },
  'Brushed stainless steel': { backgroundColor: '#C0C0C0' },
  'Clear & Black': { backgroundColor: '#000000' },
  Cyan: { backgroundColor: '#00FFFF' },
  'Dark Grey': { backgroundColor: '#A9A9A9' },
  Flerfärgad: {
    background: 'linear-gradient(to right, #FF0000, #00FF00, #0000FF)',
  },
  Genomskinlig: { backgroundColor: '#FFFFFF' },
  Gold: { backgroundColor: '#FFD700' },
  Gray: { backgroundColor: '#808080' },
  Green: { backgroundColor: '#008000' },
  Greige: { backgroundColor: '#BEBEBE' },
  Grey: { backgroundColor: '#808080' },
  Gräddvit: { backgroundColor: '#FFFDD0' },
  Grå: { backgroundColor: '#808080' },
  'Grå/Svart': { backgroundColor: '#000000' },
  Grön: { backgroundColor: '#008000' },
  Gul: { backgroundColor: '#FFFF00' },
  Guld: { backgroundColor: '#FFD700' },
  Jade: { backgroundColor: '#00A86B' },
  Klart: { backgroundColor: '#FFFFFF' },
  Koppar: { backgroundColor: '#B87333' },
  Krom: { backgroundColor: '#C0C0C0' },
  Lila: { backgroundColor: '#800080' },
  Magenta: { backgroundColor: '#FF00FF' },
  'Multi-coloured': {
    background: 'linear-gradient(to right, #FF0000, #00FF00, #0000FF)',
  },
  Multicolor: {
    background: 'linear-gradient(to right, #FF0000, #00FF00, #0000FF)',
  },
  Multicolour: {
    background: 'linear-gradient(to right, #FF0000, #00FF00, #0000FF)',
  },
  Mässing: { backgroundColor: '#B5A642' },
  Orange: { backgroundColor: '#FFA500' },
  Pink: { backgroundColor: '#FFC0CB' },
  Purple: { backgroundColor: '#800080' },
  Red: { backgroundColor: '#FF0000' },
  Rosa: { backgroundColor: '#FFC0CB' },
  'Rose Gold': { backgroundColor: '#B76E79' },
  'Rostfritt stål': {
    background: 'linear-gradient(to right, #C0B0C0, #D3C3D3, #A9A0A9)',
  },
  Röd: { backgroundColor: '#FF0000' },
  Silver: { backgroundColor: '#C0C0C0' },
  'Silver/Purple': { backgroundColor: '#800080' },
  Steel: { backgroundColor: '#C0C0C0' },
  Stål: { backgroundColor: '#C0C0C0' },
  Svart: { backgroundColor: '#000000' },
  'Svart rostfritt stål': { backgroundColor: '#000000' },
  Teal: { backgroundColor: '#008080' },
  Turkos: { backgroundColor: '#40E0D0' },
  Ultramarine: { backgroundColor: '#3F00FF' },
  Violet: { backgroundColor: '#8F00FF' },
  Vit: { backgroundColor: '#FFFFFF' },
  White: { backgroundColor: '#FFFFFF' },
  Yellow: { backgroundColor: '#FFFF00' },
  black: { backgroundColor: '#000000' },
  silver: {
    background: 'linear-gradient(to right, #C0C0C0, #D3D3D3, #A9A9A9)',
  },
}

export const getLocale = () => {
  const { sflocale: cookieLanguage } = cookieObject()
  const browserLanguage = navigator.language
  return cookieLanguage || browserLanguage
}

export const colourNameToHex = (color: string) => {
  return colorHexMap[color]
}

const toDisplayValue = (type: string) => (value: number) => {
  if (type === 'currency') {
    return value / 100
  }
  return value
}
const fromDisplayValue = (type: string) => (value: number) => {
  if (type === 'currency') {
    return Math.round(value * 100)
  }
  return value
}

export const converters = (type: string) => {
  return {
    toDisplayValue: toDisplayValue(type),
    fromDisplayValue: fromDisplayValue(type),
  }
}

type PrioProps = {
  prio?: number
}

export const byPriority = (a: PrioProps, b: PrioProps) =>
  (b.prio ?? 0) - (a.prio ?? 0)
export const cm = (...arg: (string | string[] | false | undefined)[]) =>
  arg
    .flat()
    .filter((d) => d !== undefined && d !== false)
    .flatMap((d) => d.split(' '))
    .join(' ')

export const isDefined = <T>(d: T): d is NonNullable<T> => d != null

export const textSize = (level: number) => {
  switch (level) {
    case 1:
      return 'text-xl'
    case 2:
      return 'text-lg'
    case 3:
      return 'text-base'
    default:
      return 'text-sm'
  }
}

export const useDebounce = <TArg extends unknown[], TRet>(
  fn: (...args: TArg) => TRet,
  delay: number,
) => {
  let timeout: NodeJS.Timeout
  return (...args: TArg) => {
    clearTimeout(timeout)
    timeout = globalThis.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export const cookieObject = () => {
  const cookies = document.cookie.split('; ')
  const cookieObject: { [key: string]: string } = {}
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=')
    cookieObject[key] = decodeURIComponent(value)
  }
  return cookieObject
}

const getExpires = (days?: number) => {
  if (days === undefined) return ''
  const date = new Date()
  date.setTime(date.getTime() + (days ?? 0) * 24 * 60 * 60 * 1000)
  return 'expires=' + (days < 0 ? new Date(0) : date).toUTCString() + ';'
}

export const setCookie = (name: string, value: string, days?: number) => {
  const expires = getExpires(days)
  document.cookie = `${name}=${value};${expires}path=/;SameSite=Lax;Secure`
}
