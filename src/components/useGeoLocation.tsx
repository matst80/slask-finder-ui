import { useState, useEffect } from "react";

export const useGeoLocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  return location;
};
