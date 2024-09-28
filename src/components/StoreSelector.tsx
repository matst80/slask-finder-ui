import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { stores } from "../stores";
import { useRef, useMemo, useState } from "react";
import { useSearchContext } from "../SearchContext";

export const SelectedStore = () => {
  const { locationId, setLocationId } = useSearchContext();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const selectedStore = useMemo(() => {
    return locationId != null
      ? stores.find((store) => store.id === locationId)
      : null;
  }, [locationId]);

  const center = selectedStore?.address.location ?? {
    lat: 60.605034,
    lng: 15.665223,
  };

  const openMap = () => {
    ref.current?.showModal();
    setOpen(true);
  };

  return (
    <>
      <div
        className="flex items-center text-sm text-gray-600"
        onClick={openMap}
      >
        <MapPin size={16} className="mr-1" />
        {selectedStore?.displayName ?? "Välj butik"}
      </div>
      <dialog ref={ref}>
        <div className="bg-white p-4 rounded-sm shadow w-full h-full md:w-[80vw] md:h-[80vh]">
          <h2 className="text-lg font-semibold mb-2">Välj butik</h2>
          {open && (
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {stores.map((store) => (
                <Marker
                  eventHandlers={{
                    click: () => {
                      setLocationId(store.id);
                      setOpen(false);
                      ref.current?.close();
                    },
                  }}
                  key={store.id}
                  position={[
                    store.address.location.lat,
                    store.address.location.lng,
                  ]}
                >
                  <Popup>{store.displayName}</Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </dialog>
    </>
  );
};
