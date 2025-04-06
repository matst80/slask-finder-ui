import useSWR from "swr";
import { getCategories } from "../lib/datalayer/api";

const categoryKey = "/categories";

export const useCategories = () => {
  return useSWR(categoryKey, getCategories, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    keepPreviousData: true,
  });
};
