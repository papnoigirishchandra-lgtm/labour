export type Coordinates = {
  lat: number;
  lng: number;
};

export type GeocodedLocation = Coordinates & {
  label: string;
};

export const DEFAULT_LOCATION: Coordinates = {
  lat: 20.5937,
  lng: 78.9629,
};

export const getBrowserLocation = () =>
  new Promise<Coordinates | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });

export const geocodeLocation = async (query: string): Promise<GeocodedLocation | null> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
  const first = data[0];
  if (!first) return null;

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    label: first.display_name || trimmedQuery,
  };
};

export const reverseGeocodeLocation = async (coords: Coordinates): Promise<string | null> => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(coords.lat));
  url.searchParams.set("lon", String(coords.lng));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { display_name?: string; name?: string };
  return data.display_name || data.name || null;
};
