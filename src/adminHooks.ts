import useSWR from "swr";
import { getKeyFieldsValues } from "./api";

const byName = (a: string, b: string) => a.localeCompare(b);

export const useFieldValues = (id: string | number) =>
  useSWR(`field-values/${id}`, () =>
    getKeyFieldsValues(id).then((d) => d.sort(byName))
  );

export const useUser = () => {
  return useSWR(
    "/admin/user",
    (url) =>
      fetch(url).then(async (res) => {
        if (res.status === 401) {
          return null;
        }
        return res.json();
      }),
    {
      revalidateOnFocus: true,
      errorRetryInterval: 50000,
    }
  );
};

export const useIsAdmin = () => {
  const { data } = useUser();
  return data?.role === "admin";
};
