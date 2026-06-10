export const useStores = () => {
  // biome-ignore lint/suspicious/noExplicitAny: stubbed stores
  return { data: [] as any[], isLoading: false }
}

export const useStoreWithId = (_id: string) => {
  return {
    store: undefined,
    isLoading: false,
  }
}
