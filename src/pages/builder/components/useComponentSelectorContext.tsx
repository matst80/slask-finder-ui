"use client"

export const useComponentSelectorContext = () => {
  const context = useFacetSelection()
  if (context == null) {
    throw new Error(
      "useComponentSelectorContext must be used within a ComponentSelectorProvider"
    )
  }
  return context
}
