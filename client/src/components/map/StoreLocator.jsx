import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to fix map rendering issues
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

/**
 * StoreLocator Component
 * Display store locations on an interactive map
 */
const StoreLocator = () => {
    const { theme } = useContext(ThemeContext);

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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-zinc-900">
            {/* Sidebar - Store List */}
            <div className="w-full lg:w-1/3 xl:w-1/4 h-[40vh] lg:h-full overflow-y-auto border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col z-10 shadow-xl lg:shadow-none order-2 lg:order-1">
                <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-2">Store Locations</h1>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Find your nearest Zentro store</p>
                </div>

                <div className="p-4 space-y-4">
                    {stores.map((store) => (
                        <div key={store.id} className="group bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 lg:p-5 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer hover:shadow-lg dark:hover:shadow-zinc-900/50">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{store.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-700/50 px-2 py-1 rounded-md inline-block">{store.hours.split(',')[0]} (Today)</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{store.address}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-700/50">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{store.phone}</span>
                                <button className="text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline flex items-center gap-1">
                                    Directions <span className="text-lg">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 min-h-[50vh] lg:min-h-0 lg:h-full relative bg-gray-100 dark:bg-zinc-800 order-1 lg:order-2">
                <MapContainer
                    center={centerPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0 outline-none"
                >
                    <MapResizer />
                    <TileLayer
                        attribution={theme === 'dark'
                            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }
                        url={theme === 'dark'
                            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        }
                    />
                    {stores.map((store) => (
                        <Marker key={store.id} position={store.position}>
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-gray-900 mb-1 text-base">{store.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500 font-medium">{store.phone}</span>
                                        <a href="#" className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-full font-bold hover:bg-green-800 transition-colors">
                                            Go
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default StoreLocator;
