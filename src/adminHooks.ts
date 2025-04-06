import useSWR from "swr";
import {
  getKeyFieldsValues,
  getPopularity,
  getStaticPositions,
  setStaticPositions,
  updatePopularity,
} from "./lib/datalayer/api";
import { useState } from "react";
import useSWRMutation from "swr/mutation";

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
  return true;
  // const { data } = useUser();
  // return data?.role === "admin";
};

const invertEntries = (data: Record<string, number>) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [Number(value), Number(key)])
  );
};

export const useStaticPositions = () => {
  const [dirty, setDirty] = useState(false);
  const { data, mutate } = useSWR("/admin/sort/static", () =>
    getStaticPositions().then(invertEntries)
  );
  const { trigger } = useSWRMutation(
    "/admin/sort/static",
    (_: string, { arg }: { arg: Record<number, number> }) =>
      setStaticPositions(arg)
  );
  return {
    positions: data ?? {},
    setItemPosition: (id: number, pos: number) => {
      mutate((prev) => ({ ...prev, [id]: pos }), false);
      //setPositions((prev) => ({ ...prev, [id]: pos }));
      setDirty(true);
    },
    isDirty: dirty,
    save: () => {
      if (dirty && data != null) {
        setDirty(false);
        trigger(invertEntries(data));
      }
    },
  };
};

export const usePopularity = () => {
  const [dirty, setDirty] = useState(false);
  const { data, mutate } = useSWR("/admin/popular", getPopularity);
  const { trigger } = useSWRMutation(
    "/admin/popular",
    (_: string, { arg }: { arg: Record<number, number> }) =>
      updatePopularity(arg)
  );
  return {
    popular: data ?? {},
    setItemPopularity: (id: number, pos: number) => {
      if (pos === 0) {
        mutate((prev) => {
          if (!prev) {
            return prev;
          }
          delete prev[id];
          return prev;
        }, false);
      } else {
        mutate((prev) => ({ ...prev, [id]: pos }), false);
      }

      setDirty(true);
    },
    isDirty: dirty,
    save: () => {
      if (dirty && data != null) {
        setDirty(false);
        trigger(data);
      }
    },
  };
};
