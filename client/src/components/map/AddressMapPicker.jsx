import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * LocationPicker Component
 * Interactive map for selecting delivery location
 */
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? (
        <Marker position={position}>
            <Popup>
                Selected Location
                <br />
                Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
            </Popup>
        </Marker>
    ) : null;
}

const AddressMapPicker = ({ onLocationSelect, initialPosition }) => {
    const [position, setPosition] = useState(initialPosition || { lat: 40.7128, lng: -74.0060 }); // Default NYC

    const handleLocationConfirm = () => {
        if (onLocationSelect) {
            onLocationSelect(position);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                    Click on the map to select your delivery location
                </p>
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={13}
                    style={{ height: '400px', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>

            {position && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Selected Location</p>
                            <p className="text-xs text-gray-600">
                                Latitude: {position.lat.toFixed(6)}, Longitude: {position.lng.toFixed(6)}
                            </p>
                        </div>
                        <button
                            onClick={handleLocationConfirm}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressMapPicker;
