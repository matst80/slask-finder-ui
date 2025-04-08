import useSWR from "swr";
import {
  getFacets,
  getFieldList,
  getKeyFieldsValues,
  getMissingFieldList,
  getPopularity,
  getStaticPositions,
  setStaticPositions,
  updatePopularity,
} from "./lib/datalayer/api";
import { useState } from "react";
import useSWRMutation from "swr/mutation";

export const useFieldValues = (id: string | number) =>
  useSWR(`field-values/${id}`, () => getKeyFieldsValues(id));

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

export const useFields = () => {
  return useSWR("/admin/fields", () =>
    getFieldList().then((d) =>
      Object.entries(d).map(([key, value]) => ({ ...value, key }))
    )
  );
};

export const useMissingFacets = () => {
  return useSWR("/admin/missing", () =>
    getMissingFieldList().then((d) =>
      d.map((value) => ({
        ...value,
        key: String(value.id),
      }))
    )
  );
};

export const useAdminFacets = () => {
  return useSWR("admin-facet-list", getFacets, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};

export const useUpdateFacet = () => {
  const { trigger } = useSWRMutation(
    "/admin/facets",
    (_: string, { arg }: { arg: { id: number; [key: string]: unknown } }) =>
      fetch(`/admin/facets/${arg.id}`, {
        method: "PUT",
        body: JSON.stringify(arg),
      })
  );
  return trigger;
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
