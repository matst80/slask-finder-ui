import { MapPin } from "lucide-react";
import { stores } from "../datalayer/stores";
import { useMemo } from "react";
import { useQueryHelpers } from "../hooks/searchHooks";

export const SelectedStore = () => {
  const {
    query: { stock },
  } = useQueryHelpers();

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
