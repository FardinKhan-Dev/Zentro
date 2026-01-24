import React, { useState } from 'react';
import { useGetMeQuery, useUpdateProfileMutation, useDeleteAddressMutation, useAddAddressMutation, useUpdateAddressMutation } from '../features/auth/authApi';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiSmartphone } from '@react-icons/all-files/fi/FiSmartphone';
import { FiMapPin } from '@react-icons/all-files/fi/FiMapPin';
import { FiPackage } from '@react-icons/all-files/fi/FiPackage';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiEdit2 } from '@react-icons/all-files/fi/FiEdit2';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiGrid } from '@react-icons/all-files/fi/FiGrid';
import { FiCreditCard } from '@react-icons/all-files/fi/FiCreditCard';
import { FiBell } from '@react-icons/all-files/fi/FiBell';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApi';
import AddressForm from '../components/checkout/AddressForm';
import { OrdersPage } from '../components/orders';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import ChangePassword from '../components/auth/ChangePassword';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: userData, isLoading } = useGetMeQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [deleteAddress] = useDeleteAddressMutation();
    const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
    const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();

    const [activeTab, setActiveTab] = useState('orders'); // orders, addresses, settings
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const user = userData?.data;
    const [logoutMutation] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            // Call server logout endpoint to clear cookies
            await logoutMutation().unwrap();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear Redux state
            dispatch(logout());
            navigate('/');
            toast.success('Logged out successfully');
        }
    };

    const handleAddressSubmit = async (formData) => {
        try {
            if (editingAddress?._id) {
                await updateAddress({ addressId: editingAddress._id, ...formData }).unwrap();
                toast.success('Address updated');
            } else {
                await addAddress(formData).unwrap();
                toast.success('Address added successfully');
            }
            setShowAddressForm(false);
            setEditingAddress(null);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error(error?.data?.message || 'Failed to save address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(addressId).unwrap();
                toast.success('Address deleted');
            } catch (error) {
                console.error('Failed to delete address:', error);
                toast.error('Failed to delete address');
            }
        }
    };

    const openAddAddress = () => {
        setEditingAddress({ phoneNumber: user?.phoneNumber || '' });
        setShowAddressForm(true);
    };

    const openEditAddress = (addr) => {
        setEditingAddress(addr);
        setShowAddressForm(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            name: formData.get('name'),
            email: formData.get('email'),
            phoneNumber: formData.get('phoneNumber'),
        };

        try {
            await updateProfile(updates).unwrap();
            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error?.data?.message || 'Failed to update profile');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'orders', label: 'My Orders', icon: FiPackage },
        { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
        { id: 'settings', label: 'Account Settings', icon: FiSettings },
    ];

    return (
        <div className="h-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar Section */}
                <div className="w-full md:w-60 xl:w-72 bg-gray-50/50 dark:bg-zinc-900/50 border-r border-gray-100 dark:border-zinc-800 px-8 py-8 md:px-4 xl:p-8 flex flex-col">
                    {/* User Info Header */}
                    <div className="mb-10 text-center md:text-left">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4 mx-auto md:mx-0 overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
                        <span className="inline-block px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider rounded">Member</span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 flex-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-medium ${activeTab === tab.id
                                    ? 'bg-black dark:bg-white  text-white dark:text-black shadow-lg shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-zinc-800 scale-105'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="hidden md:block mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium"
                        >
                            <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="flex-1 p-8 lg:p-12 bg-white dark:bg-zinc-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="h-full flex flex-col">
                                    <OrdersPage />
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your delivery locations</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <FiMapPin size={20} />
                                        </div>
                                    </div>

                                    {showAddressForm ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="max-w-xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {editingAddress?._id ? 'Edit Address' : 'New Address'}
                                                </h3>
                                                <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium">Cancel</button>
                                            </div>
                                            <div className="border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
                                                <AddressForm
                                                    onSubmit={handleAddressSubmit}
                                                    isSaving={isAddingAddress || isUpdatingAddress}
                                                    initialData={editingAddress || {}}
                                                    submitLabel="Save Address"
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="grid grid-rows-1 xl:grid-cols-2 gap-4">
                                            {user?.addresses?.map((addr) => (
                                                <div key={addr._id} className="group relative p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-black/50 dark:hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-black/50">
                                                    {addr.isDefault && (
                                                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded">Default</span>
                                                    )}
                                                    <div className="pr-12">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg text-gray-900 dark:text-white">
                                                                <FiMapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 dark:text-white">{addr.street}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                    {addr.city}, {addr.state} {addr.zipCode}<br />
                                                                    {addr.country}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium pl-[52px]">
                                                            <FiSmartphone size={14} className="text-gray-400" /> +91 {addr.phoneNumber}
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-900 pl-2">
                                                        <button onClick={() => openEditAddress(addr)} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all">
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add New Address Card */}
                                            <div
                                                onClick={openAddAddress}
                                                className="group cursor-pointer p-6 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all duration-300 flex flex-col items-center justify-center min-h-[180px] gap-3"
                                            >
                                                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                    <FiPlus className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                                </div>
                                                <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Add New Address</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <div>
                                    {/* Personal Information Section */}
                                    <div className="mb-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your personal information</p>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <FiSettings size={20} />
                                            </div>
                                        </div>

                                        {isEditingProfile ? (
                                            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 space-y-6 shadow-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            defaultValue={user?.name}
                                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            defaultValue={user?.email}
                                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            defaultValue={user?.phoneNumber}
                                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={isUpdating}
                                                        className="flex-1 bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                                                    >
                                                        {isUpdating ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditingProfile(false)}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                                    <p className="text-gray-900 dark:text-white font-medium text-lg">{user?.name}</p>
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium text-lg">
                                                        <FiSmartphone className="text-gray-400" />
                                                        {user?.phoneNumber || 'Not added'}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                                    <p className="text-gray-900 dark:text-white font-medium text-lg">{user?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="absolute top-2 right-2 flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors shadow-sm"
                                                >
                                                    <FiEdit2 /> Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Security Section (Collapsible) */}
                                    <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account security</p>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setShowChangePassword(!showChangePassword)}
                                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                        <FiLock size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-gray-900 dark:text-white text-lg">Change Password</span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">Update your account password</span>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${showChangePassword ? 'bg-black dark:bg-white text-white dark:text-black rotate-180' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'}`}>
                                                    <FiChevronDown size={20} />
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {showChangePassword && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    >
                                                        <div className="p-6 pt-0 border-t border-gray-100 dark:border-zinc-800">
                                                            <div className="mt-6">
                                                                <ChangePassword isEmbedded={true} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
