import { useHashFacets } from "../searchHooks";
import { Sorting } from "./Sorting";
import { SelectedStore } from "./StoreSelector";

export const ResultHeader = () => {
  const { data } = useHashFacets();
  if (!data || data.totalHits === 0) {
    return null;
  }

  return (
    <header className="flex justify-between gap-2 items-center mb-6">
      <h1 className="md:text-2xl font-bold">Produkter ({data.totalHits})</h1>
      <SelectedStore />
      <div className="relative">
        <Sorting />
      </div>
    </header>
  );
};
