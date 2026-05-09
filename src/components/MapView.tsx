import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIconPrototype = L.Icon.Default.prototype as L.Icon.Default & {
  _getIconUrl?: () => string;
};

delete defaultIconPrototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface WorkerMarker {
  id: string;
  name: string;
  skill: string;
  lat: number;
  lng: number;
  rating: number | null;
  price: number;
}

interface MapViewProps {
  workers?: WorkerMarker[];
  center?: [number, number];
  zoom?: number;
  showServiceArea?: boolean;
  className?: string;
  selectedLocation?: {
    lat: number;
    lng: number;
    label?: string;
  } | null;
  onMapClick?: (location: { lat: number; lng: number }) => void;
}

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

const ClickHandler = ({ onMapClick }: { onMapClick: (location: { lat: number; lng: number }) => void }) => {
  useMapEvents({
    click: (event) => {
      onMapClick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

const MapView = ({
  workers = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  showServiceArea = true,
  className = "h-[400px] w-full rounded-2xl overflow-hidden",
  selectedLocation = null,
  onMapClick,
}: MapViewProps) => {
  return (
    <div className={className}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{selectedLocation.label || "Selected Location"}</strong>
                <br />
                {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
        {workers.map((worker) => (
          <Marker key={worker.id} position={[worker.lat, worker.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{worker.name}</strong>
                <br />
                {worker.skill} - Rs. {worker.price}/hr
                <br />
                Rating: {worker.rating || "N/A"}
              </div>
            </Popup>
          </Marker>
        ))}
        {showServiceArea &&
          workers.map((worker) => (
            <Circle
              key={`area-${worker.id}`}
              center={[worker.lat, worker.lng]}
              radius={10000}
              pathOptions={{
                color: "hsl(175, 80%, 50%)",
                fillColor: "hsl(175, 80%, 50%)",
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
