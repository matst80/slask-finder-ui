import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'
import { useSdkNotification } from './hooks/NotificationContext'
import { ItemPrice, ItemValues, MutationResult } from './types'

export const isDefined = <T>(d: T): d is NonNullable<T> => d != null

type PrioProps = {
  prio?: number
}

export const byPriority = (a: PrioProps, b: PrioProps) =>
  (b.prio ?? 0) - (a.prio ?? 0)

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

// const FIELD_SEPARATOR = ":";
// const ID_VALUE_SEPARATOR = "=";

// export const queryToHash = ({
//   range,
//   sort,
//   page,
//   pageSize,
//   query,
//   stock,
//   string,
// }: ItemsQuery): string => {
//   const filterObj = filteringQueryToHash({
//     range,
//     stock,
//     query,
//     string,
//   })
//   if (sort != null && sort !== 'popular') {
//     filterObj.sort = sort
//   }
//   if (page != null) {
//     filterObj.page = page.toString()
//   }
//   if (pageSize != null && pageSize !== 40) {
//     filterObj.size = pageSize.toString()
//   }
//   return new URLSearchParams(filterObj).toString()
// }

// export const filteringQueryToHash = ({
//   range,
//   string,
//   query,
//   stock,
// }: FilteringQuery): Record<string, string> => {
//   const result: Record<string, string> = {}
//   if (stock != null && stock.length > 0) {
//     result.stock = stock.join(FIELD_SEPARATOR)
//   }
//   if (query != null && query.length > 0) {
//     result.q = query
//   }
//   const ints =
//     range?.map(({ id, min, max }) => {
//       return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`
//     }) ?? []
//   if (ints.length > 0) {
//     result.i = ints.join(FIELD_SEPARATOR)
//   }

//   // const nums =
//   //   number?.map(({ id, min, max }) => {
//   //     return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`;
//   //   }) ?? [];
//   // if (nums.length > 0) {
//   //   result.n = nums.join(FIELD_SEPARATOR);
//   // }

//   const strs =
//     string?.map(({ id, value, exclude = false }) => {
//       return `${id}${ID_VALUE_SEPARATOR}${exclude ? '!' : ''}${
//         Array.isArray(value) ? value.join('||') : value
//       }`
//     }) ?? []
//   if (strs.length) {
//     result.s = strs.join(FIELD_SEPARATOR)
//   }
//   return result
// }

// export const facetQueryToHash = ({
//   range,
//   query,
//   stock,
//   string,
// }: FacetQuery): string => {
//   const obj = filteringQueryToHash({ range, stock, string, query })
//   return new URLSearchParams(obj).toString()
// }

// export const toQuery = (data: ItemsQuery): string => {
//   const { range, sort, page, pageSize, query, stock, string } = data

//   const result = new URLSearchParams({
//     page: (page ?? 0).toString(),
//     size: (pageSize ?? 40)?.toString(),
//     sort: sort ?? 'popular',
//     query: query ?? '',
//   })
//   range?.forEach(({ id, min, max }) => {
//     result.append('rng', `${id}:${min}-${max}`)
//   })

//   string?.forEach(({ id, value }) => {
//     result.append(
//       'str',
//       `${id}:${Array.isArray(value) ? value.join('||') : value}`,
//     )
//   })
//   stock?.forEach((s) => {
//     result.append('stock', s)
//   })

//   return result.toString()
// }

export const matchValue = (
  itemValue: string[] | string | number | undefined,
  filterValue: string[] | string | number,
): boolean => {
  if (typeof itemValue === 'string' && typeof filterValue === 'string') {
    return itemValue.toLowerCase() === filterValue.toLowerCase()
  }
  if (typeof itemValue === 'number' && typeof filterValue === 'number') {
    return itemValue === filterValue
  }
  if (Array.isArray(itemValue) && Array.isArray(filterValue)) {
    return itemValue.some((value) =>
      filterValue.some((filter) => matchValue(value, filter)),
    )
  }
  if (Array.isArray(itemValue) && typeof filterValue === 'string') {
    return itemValue.some((value) => matchValue(value, filterValue))
  }
  if (typeof itemValue === 'string' && Array.isArray(filterValue)) {
    return filterValue.some((value) => matchValue(itemValue, value))
  }
  return false
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

export const useStateFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<MutationResult<T>>,
  config?: SWRMutationConfiguration<MutationResult<T>, Error, string, U>,
) => {
  const showNotification = useSdkNotification()
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    revalidate: false,
    populateCache: (data, current) => {
      if (data?.mutations && data.mutations.length > 0) {
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
      return data?.result ?? current
    },
    ...config,
  })
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
