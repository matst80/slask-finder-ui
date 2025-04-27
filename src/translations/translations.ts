import { PathInto } from "../lib/types";
import { english } from "./english";
import { norwegian } from "./norwegian";
import { swedish } from "./swedish";

export type Translations = typeof swedish | typeof english | typeof norwegian;
export type TranslationKey = PathInto<Translations>;
