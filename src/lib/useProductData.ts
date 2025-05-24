import { useMemo } from "react";
import { getPrice } from "./utils";
import { Item, ValueMap } from "./types";
import { getRating } from "./utils";

export const useProductData = (values: Item["values"]) => {
  return useMemo(() => {
    const rating = getRating(values);

    const soldBy = values[ValueMap.SoldBy];
    const isOutlet = values?.[ValueMap.Category1] == "Outlet";
    const grade = values[ValueMap.Grade];
    const price = getPrice(values);
    const stockLevel = values[ValueMap.StockLevel];
    const isOwn = soldBy == null || soldBy == "Elgiganten";

    return {
      isOwn,
      rating,
      soldBy,
      isOutlet,
      grade,
      price,
      stockLevel,
    };
  }, [values]);
};
