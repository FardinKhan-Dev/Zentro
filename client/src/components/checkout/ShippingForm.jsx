import React, { useState, useEffect } from 'react';
import { useGetMeQuery, useAddAddressMutation } from '../../features/auth/authApi';
import AddressForm from './AddressForm';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiCheckCircle } from '@react-icons/all-files/fi/FiCheckCircle';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiMapPin } from '@react-icons/all-files/fi/FiMapPin';
import toast from 'react-hot-toast';

/**
 * ShippingForm Component
 * Handles selection of saved addresses or entry of new ones.
 */
const ShippingForm = ({ onSubmit, initialData = {} }) => {
    const { data: userData, isLoading: isUserLoading } = useGetMeQuery();
    const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();

    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

    // If user has no addresses, show form by default
    useEffect(() => {
        if (!isUserLoading && userData?.data?.addresses?.length === 0) {
            setShowNewAddressForm(true);
        }
    }, [userData, isUserLoading]);

    // Handle selecting a saved address
    const handleSelectAddress = (index) => {
        setSelectedAddressIndex(index);
        setShowNewAddressForm(false);
    };

    // Handle new address submission
    const handleNewAddressSubmit = async (addressData) => {
        // If "Save this address" is checked, save to profile
        if (addressData.isDefault) {
            try {
                await addAddress(addressData).unwrap();
                toast.success('Address saved to profile');
                setShowNewAddressForm(false);
                // Select the newly added address (last one)
                // Note: Real-time update via tags should handle re-render
            } catch (error) {
                console.error('Failed to save address:', error);
                toast.error('Failed to save address');
            }
        }

        // Pass data to parent (CheckoutPage)
        onSubmit(addressData);
    };

    // Handle "Use this address" for saved addresses
    const handleUseSavedAddress = (e) => {
        e.preventDefault();
        if (selectedAddressIndex !== null && userData?.data?.addresses[selectedAddressIndex]) {
            onSubmit(userData?.data?.addresses[selectedAddressIndex]);
        }
    };

    if (isUserLoading) {
        return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
    }

    const savedAddresses = userData?.data?.addresses || [];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMapPin /> Shipping Address
            </h2>

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectAddress(index)}
                            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressIndex === index
                                ? 'border-black dark:border-white bg-gray-50 dark:bg-zinc-800 ring-1 ring-black dark:ring-white'
                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500'
                                }`}
                        >
                            {selectedAddressIndex === index && (
                                <div className="absolute top-4 right-4 text-green-500">
                                    <FiCheckCircle size={20} />
                                </div>
                            )}

                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{addr.street}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.country}</p>
                            {addr.phoneNumber && (
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="font-medium uppercase tracking-wider">+91</span>{addr.phoneNumber}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Add New Address Card */}
                    <button
                        onClick={() => {
                            setShowNewAddressForm(true);
                            setSelectedAddressIndex(null);
                        }}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all min-h-[140px] ${showNewAddressForm ? 'bg-gray-50 dark:bg-zinc-800 border-gray-400 dark:border-zinc-500' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                            <FiPlus size={20} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Add New Address</span>
                    </button>
                </div>
            )}

            {/* Render Form or "Use Selected" Button */}
            {showNewAddressForm ? (
                <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm animate-fade-in">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Enter New Address</h3>
                    <AddressForm
                        onSubmit={handleNewAddressSubmit}
                        isSaving={isAddingAddress}
                        initialData={{
                            ...initialData,
                            phoneNumber: userData?.data?.phoneNumber || ''
                        }}
                        submitLabel="Deliver Here"
                    />
                </div>
            ) : (
                <div className="mt-8">
                    <button
                        onClick={handleUseSavedAddress}
                        disabled={selectedAddressIndex === null}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Deliver to this Address
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShippingForm;
