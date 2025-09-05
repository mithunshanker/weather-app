"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CRITICAL: Imports Leaflet CSS for proper map rendering
import L from 'leaflet';

// Fix for default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A custom component to update the map's view when props change
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Map({ lat, lon, city }) {
  if (lat === null || lon === null) {
    return <div>Map data is not available.</div>;
  }
  
  const position = [lat, lon];

  return (
    <MapContainer center={position} zoom={11} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={position} zoom={11} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <b>{city}</b>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

