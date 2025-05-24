import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

export const useFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<T>,
  config?: SWRMutationConfiguration<T, Error, string, U>
) => {
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    ...config,
    populateCache: true,
  });
};
