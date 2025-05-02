import { Impression } from "../lib/datalayer/beacons";
import { Item } from "../lib/types";
import { isDefined } from "../utils";

export const toImpression = (item: Item, position: number): Impression => ({
  id: Number(item.id),
  position,
  name: item.title,
  category: [10, 11, 12, 13, 14]
    .map((i) => {
      const v = item.values?.[i];
      if (v == null) {
        return null;
      }
      if (Array.isArray(v)) {
        return v[0];
      }
      return String(v);
    })
    .filter(isDefined),
  brand: item.values?.["2"],
  price: item.values?.["4"],
  //stock: item.stockLevel!=null,
  //img: item.img,
});
