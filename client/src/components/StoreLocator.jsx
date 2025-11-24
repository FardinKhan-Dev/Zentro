import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * StoreLocator Component
 * Display store locations on an interactive map
 */
const StoreLocator = () => {
    // Sample store locations - replace with real data from API
    const stores = [
        {
            id: 1,
            name: 'Zentro Downtown',
            address: '123 Main St, New York, NY 10001',
            position: [40.7128, -74.0060],
            hours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
            phone: '(555) 123-4567',
        },
        {
            id: 2,
            name: 'Zentro Uptown',
            address: '456 Broadway, New York, NY 10013',
            position: [40.7589, -73.9851],
            hours: 'Mon-Sat: 10AM-8PM, Sun: 11AM-5PM',
            phone: '(555) 234-5678',
        },
        {
            id: 3,
            name: 'Zentro Brooklyn',
            address: '789 Bedford Ave, Brooklyn, NY 11249',
            position: [40.7081, -73.9571],
            hours: 'Mon-Fri: 9AM-7PM, Sat-Sun: 10AM-6PM',
            phone: '(555) 345-6789',
        },
    ];

    const centerPosition = [40.7128, -74.0060]; // NYC center

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Locations</h1>
                <p className="text-gray-600">Find a Zentro store near you</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Store List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Stores</h2>
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                            <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Hours:</span> {store.hours}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Phone:</span> {store.phone}
                            </p>
                            <button className="mt-3 text-green-500 hover:text-green-600 font-medium text-sm">
                                Get Directions →
                            </button>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <MapContainer
                            center={centerPosition}
                            zoom={12}
                            style={{ height: '600px', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {stores.map((store) => (
                                <Marker key={store.id} position={store.position}>
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{store.address}</p>
                                            <p className="text-sm text-gray-600 mb-1">{store.hours}</p>
                                            <p className="text-sm text-gray-600">{store.phone}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreLocator;
