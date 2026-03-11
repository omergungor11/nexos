"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Nexos Emlak office location (İskele, Kuzey Kıbrıs)
const OFFICE_LAT = 35.2856;
const OFFICE_LNG = 33.8839;

export default function ContactMap() {
  return (
    <MapContainer
      center={[OFFICE_LAT, OFFICE_LNG]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[OFFICE_LAT, OFFICE_LNG]}>
        <Popup>
          <div className="space-y-1">
            <p className="font-semibold">Nexos Emlak</p>
            <p className="text-sm text-gray-600">
              İskele, Kuzey Kıbrıs
            </p>
            <p className="text-xs text-gray-500">Pzt–Cmt: 09:00–18:00</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
