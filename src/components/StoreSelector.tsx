import { MapPin } from "lucide-react";
import { stores } from "../lib/datalayer/stores";
import { useMemo } from "react";
import { useQuery } from "../lib/hooks/useQuery";

export const SelectedStore = () => {
  const {
    query: { stock },
  } = useQuery();

  const locationId = stock?.[0];

  const selectedStore = useMemo(() => {
    return locationId != null
      ? stores.find((store) => store.id === locationId)
      : null;
  }, [locationId]);

  return (
    <>
      {selectedStore != null && (
        <div className="hidden md:flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-1" />
          {selectedStore.displayName}
        </div>
      )}
    </>
  );
};
