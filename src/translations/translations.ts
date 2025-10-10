import { PathInto } from '../lib/types'
import { english } from './english'
import { swedish } from './swedish'

export type Translations = typeof swedish | typeof english
export type TranslationKey = PathInto<Translations>
