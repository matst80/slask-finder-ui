/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { english } from './english'
import { swedish } from './swedish'

export type Translations = typeof swedish | typeof english
export type TranslationKey = PathInto<Translations>

export interface BaseTranslationType {
  [key: string]: string | BaseTranslationType
}

export type PathInto<T extends BaseTranslationType> =
  BaseTranslationType extends T
    ? string
    : keyof {
        [K in keyof T as T[K] extends string
          ? K
          : T[K] extends BaseTranslationType
            ? `${K & string}.${PathInto<T[K]> & string}`
            : never]: string
      }

export const setNestedValues = <T extends BaseTranslationType>(
  obj: T,
  onValue: (key: string, value: unknown) => void,
  path: (string & keyof T)[] = [],
) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      setNestedValues(value, onValue, [...path, key])
    } else {
      onValue([...path, key].join('.'), value)
    }
  })
}

export const getNestedProperty = <T extends BaseTranslationType>(
  obj: T,
  path: PathInto<T> & string,
) => {
  return path
    .split('.')
    .reduce(
      (result, key) => (result ? result[key] : undefined),
      obj as Record<string, any>,
    )
}

export function extractFromObject(
  object: Record<string, unknown>,
  path: Array<string>,
  index = 0,
): string | undefined {
  const key = path[index]
  if (key === undefined) {
    return ''
  }
  const result = object[key]
  if (result == null) {
    return undefined
  }
  if (typeof result === 'object') {
    return extractFromObject(Object(result), path, index + 1)
  }
  return String(result)
}

export const replaceMustacheKeys = (
  text: string,
  object?: Record<string, unknown>,
) =>
  object
    ? text.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
        const value = extractFromObject(object, key.trim().split('.'))
        if (value === undefined) {
          return key
        }
        return value
      })
    : text
