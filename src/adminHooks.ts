import useSWR from "swr";
import { getKeyFieldsValues } from "./api";

const byName = (a: string, b: string) => a.localeCompare(b);

export const useFieldValues = (id: string | number) =>
  useSWR(`field-values/${id}`, () =>
    getKeyFieldsValues(id).then((d) => d.sort(byName))
  );
