type Input = { coords: { latitude: number; longitude: number } };

export const calculateDistance = (
  you: Input,
  other: {
    lat: number;
    lng: number;
  }
) => {
  const R = 6371e3; // metres
  const φ1 = (you.coords.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (other.lat * Math.PI) / 180;
  const Δφ = ((other.lat - you.coords.latitude) * Math.PI) / 180;
  const Δλ = ((other.lng - you.coords.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d / 1000;
};
