import { ItemsQuery } from '../types'

export const mergeFilters = (
  a: Pick<ItemsQuery, 'string' | 'range'>,
  b: Pick<ItemsQuery, 'string' | 'range'>,
): Pick<ItemsQuery, 'string' | 'range'> => {
  const string = [
    ...(a.string ?? []).filter((f) => !b.string?.some((s) => s.id === f.id)),
    ...(b.string ?? []),
  ]
  const range = [
    ...(a.range ?? []).filter((r) => !b.range?.some((s) => s.id === r.id)),
    ...(b.range ?? []),
  ]
  return { string, range }
}
