"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons (Webpack/Next issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper to update view on prop change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({ lat, lon, city }) {
  const [dynamicZoom, setDynamicZoom] = useState(11);
  const [iconSize, setIconSize] = useState([25, 41]);

  // Responsive zoom + marker size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDynamicZoom(10);
        setIconSize([22, 36]); // Smaller marker on mobile
      } else {
        setDynamicZoom(11);
        setIconSize([25, 41]); // Default desktop marker
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom icon based on size
  const customIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [0, -iconSize[1]],
        shadowSize: [41, 41],
      }),
    [iconSize]
  );

  if (lat === null || lon === null) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Map data is not available.
      </div>
    );
  }

  const position = [lat, lon];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Map section */}
      <div className="h-80 md:h-full w-full">
        <MapContainer
          center={position}
          zoom={dynamicZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <ChangeView center={position} zoom={dynamicZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <b>{city}</b>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Info/Details section */}
      <div className="flex flex-col justify-center items-start p-4 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-black">{city}</h2>
        <p className="text-gray-600">Latitude: {lat}</p>
        <p className="text-gray-600">Longitude: {lon}</p>
      </div>
    </div>
  );
}
