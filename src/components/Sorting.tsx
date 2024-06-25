import { useSearchContext } from "../SearchContext";
import { Sort } from "../types";

export const Sorting = () => {
  const { sort, setSort } = useSearchContext();
  return (
    <select
      id="sorting"
      value={sort}
      onChange={(e) => setSort(e.target.value as Sort)}
    >
      <option value="popular">Popularitet</option>
      <option value="price">Pris</option>
      <option value="price_desc">Pris fallande</option>
    </select>
  );
};
