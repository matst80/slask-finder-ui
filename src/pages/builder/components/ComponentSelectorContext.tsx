"use client"
import { Dispatch, SetStateAction, createContext } from "react"

export type ComponentSelectorContext = {
  view: "table" | "list"
  setView: Dispatch<SetStateAction<"table" | "list">>
  selectedIds?: number[]
  tableSort?: [number, "asc" | "desc"]
  setTableSort?: Dispatch<SetStateAction<[number, "asc" | "desc"] | undefined>>
}
export const ComponentSelectorContext = createContext<ComponentSelectorContext | null>(
  null
)
