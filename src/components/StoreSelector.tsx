import { MapPin } from "lucide-react";
import { stores } from "../stores";
import { useMemo } from "react";
import { useQueryHelpers } from "../searchHooks";

export const SelectedStore = () => {
  const {
    query: { stock: locationId },
  } = useQueryHelpers();

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
