import { useState, useEffect } from 'react';
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from '../../features/admin/adminApi';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiBell } from '@react-icons/all-files/fi/FiBell';
import { FiGlobe } from '@react-icons/all-files/fi/FiGlobe';
import { FiSmartphone } from '@react-icons/all-files/fi/FiSmartphone';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiBox } from '@react-icons/all-files/fi/FiBox';
import { FiEdit2 } from '@react-icons/all-files/fi/FiEdit2';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiShield } from '@react-icons/all-files/fi/FiShield';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { data, isLoading: isFetching } = useGetPlatformSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdatePlatformSettingsMutation();
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        storeName: '',
        supportEmail: '',
        storeDescription: '',
        currency: 'USD',
        notifications: {
            newOrder: true,
            lowStock: true,
            newSignup: true,
            systemUpdates: true
        },
        security: {
            sessionTimeout: '30',
            passwordPolicy: 'strong'
        }
    });

    useEffect(() => {
        if (data?.data) {
            setFormData(data.data);
        }
    }, [data]);

    // Reset editing state when switching tabs
    useEffect(() => {
        setIsEditing(false);
        // Also reset form data to latest server data to discard unsaved edits from previous tab
        if (data?.data) {
            setFormData(data.data);
        }
    }, [activeTab, data]);

    const handleGeneralChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSecurityChange = (eOrKey, value) => {
        let name, val;

        if (typeof eOrKey === 'string') {
            // Called as (key, value)
            name = eOrKey;
            val = value;
        } else {
            // Called as event object
            name = eOrKey.target.name;
            val = eOrKey.target.value;
        }

        setFormData({
            ...formData,
            security: {
                ...formData.security,
                [name]: val
            }
        });
    };

    const handleNotificationToggle = async (key) => {
        // Optimistic update
        const updatedNotifications = {
            ...formData.notifications,
            [key]: !formData.notifications[key]
        };

        const updatedFormData = {
            ...formData,
            notifications: updatedNotifications
        };

        setFormData(updatedFormData);

        try {
            await updateSettings(updatedFormData).unwrap();
            console.log('Notification setting saved');
            toast.success('Notification setting updated');
        } catch (error) {
            console.error('Failed to save notification setting:', error);
            setFormData(formData);
            toast.error('Failed to update setting');
        }
    };

    const handleSave = async () => {
        try {
            await updateSettings(formData).unwrap();
            toast.success('Settings saved successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings. Please try again.');
        }
    };

    const handleCancel = () => {
        if (data?.data) {
            setFormData(data.data);
        }
        setIsEditing(false);
    };

    const ActionButtons = () => {
        if (!isEditing) {
            return (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit Settings
                </button>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex items-center px-4 py-2 bg-white dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                    <FiX className="w-4 h-4 mr-2" />
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    {isUpdating ? (
                        <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin mr-2" />
                    ) : (
                        <FiSave className="w-5 h-5 mr-2" />
                    )}
                    Save Changes
                </button>
            </div>
        );
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Manage platform configurations
                    </p>
                </div>
                {/* Horizontal Tabs */}
                <div className="flex p-1 bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-gray-100 dark:border-white/10 overflow-x-auto">
                    {[
                        { id: 'general', icon: FiGlobe, label: 'General' },
                        { id: 'notifications', icon: FiBell, label: 'Notifications' },
                        { id: 'security', icon: FiShield, label: 'Security' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl px-8 py-4 rounded-2xl border border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">General Information</h3>
                            <ActionButtons />
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleGeneralChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                            ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                            : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        name="supportEmail"
                                        value={formData.supportEmail}
                                        onChange={handleGeneralChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                            ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                            : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0'
                                            }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Description</label>
                                <textarea
                                    rows="4"
                                    name="storeDescription"
                                    value={formData.storeDescription}
                                    onChange={handleGeneralChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                        ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                        : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0 resize-none'
                                        }`}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleGeneralChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                        ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                        : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0 appearance-none'
                                        }`}
                                >
                                    <option value="USD" className="dark:bg-gray-900">USD ($)</option>
                                    <option value="EUR" className="dark:bg-gray-900">EUR (€)</option>
                                    <option value="GBP" className="dark:bg-gray-900">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl px-8 py-6 rounded-2xl border border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                            {[
                                { key: 'newOrder', title: 'New Order Alerts', desc: 'Get notified when a new order is placed', icon: FiSmartphone },
                                { key: 'lowStock', title: 'Low Stock Warnings', desc: 'Notify when product stock is low', icon: FiBox },
                                { key: 'newSignup', title: 'New Customer Signups', desc: 'Notification for new user registrations', icon: FiUsers },
                                { key: 'systemUpdates', title: 'System Updates', desc: 'Receive updates about system maintenance', icon: FiGlobe },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-900 dark:text-white shadow-sm mr-4">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifications?.[item.key] ?? true}
                                            onChange={() => handleNotificationToggle(item.key)}
                                            className="sr-only peer"
                                        />
                                        <div className="
                                            w-11 h-6 rounded-full peer-focus:outline-none peer 
                                            transition-colors duration-200
                                            bg-gray-200 dark:bg-gray-700 
                                            peer-checked:bg-black dark:peer-checked:bg-white
                                            
                                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                            after:rounded-full after:h-5 after:w-5 after:transition-all
                                            after:bg-white/80 dark:after:bg-black/40
                                            
                                            peer-checked:after:translate-x-full 
                                            peer-checked:after:bg-white dark:peer-checked:after:bg-black/80
                                            peer-checked:after:border-white
                                        "></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h3>
                            <ActionButtons />
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Require 2FA for all admin accounts</p>
                                    </div>
                                    <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.security?.twoFactorAuth ?? false}
                                            onChange={() => handleSecurityChange('twoFactorAuth', !formData.security?.twoFactorAuth)}
                                            disabled={!isEditing}
                                            className="sr-only peer"
                                        />
                                        <div className="
                                            w-11 h-6 rounded-full peer-focus:outline-none peer 
                                            transition-colors duration-200
                                            bg-gray-200 dark:bg-gray-700 
                                            peer-checked:bg-black dark:peer-checked:bg-white
                                            
                                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                            after:rounded-full after:h-5 after:w-5 after:transition-all
                                            after:bg-white/80 dark:after:bg-black/40
                                            
                                            peer-checked:after:translate-x-full 
                                            peer-checked:after:bg-white dark:peer-checked:after:bg-black/80
                                            peer-checked:after:border-white
                                        "></div>
                                    </label>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout</label>
                                    <select
                                        name="sessionTimeout"
                                        value={formData.security?.sessionTimeout || '30'}
                                        onChange={handleSecurityChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                            ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                            : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0 appearance-none'
                                            }`}
                                    >
                                        <option value="15" className="dark:bg-gray-900">15 minutes</option>
                                        <option value="30" className="dark:bg-gray-900">30 minutes</option>
                                        <option value="60" className="dark:bg-gray-900">1 hour</option>
                                        <option value="never" className="dark:bg-gray-900">Never</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Policy</label>
                                    <select
                                        name="passwordPolicy"
                                        value={formData.security?.passwordPolicy || 'strong'}
                                        onChange={handleSecurityChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing
                                            ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white text-gray-900 dark:text-white'
                                            : 'bg-transparent border-transparent text-gray-900 dark:text-white font-medium px-0 appearance-none'
                                            }`}
                                    >
                                        <option value="strong" className="dark:bg-gray-900">Strong (Recommended)</option>
                                        <option value="medium" className="dark:bg-gray-900">Medium</option>
                                        <option value="weak" className="dark:bg-gray-900">Weak</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
