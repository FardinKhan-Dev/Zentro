import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../features/auth/authApi';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiMail } from '@react-icons/all-files/fi/FiMail';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiCamera } from '@react-icons/all-files/fi/FiCamera';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { FiEdit2 } from '@react-icons/all-files/fi/FiEdit2';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiPhone } from '@react-icons/all-files/fi/FiPhone';
import { FiUpload } from '@react-icons/all-files/fi/FiUpload';
import toast from 'react-hot-toast';

const AdminProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    // -- State --
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // Profile Details Form State
    const [detailsForm, setDetailsForm] = useState({
        name: '',
        phoneNumber: '',
        email: '' // Read-only
    });

    // Avatar State
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // -- Effects --
    useEffect(() => {
        if (user) {
            setDetailsForm({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || ''
            });
            setAvatarPreview(user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=000&color=fff&size=128`);
            setAvatarFile(null); // Reset file on user reload
        }
    }, [user]);

    // -- Handlers --

    // Avatar Selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleDetailsChange = (e) => {
        setDetailsForm({ ...detailsForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleCancelDetails = () => {
        setIsEditingDetails(false);
        setDetailsForm({
            name: user.name || '',
            phoneNumber: user.phoneNumber || '',
            email: user.email || ''
        });
        setAvatarPreview(user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=000&color=fff&size=128`);
        setAvatarFile(null);
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', detailsForm.name);
            formData.append('phoneNumber', detailsForm.phoneNumber);

            if (avatarFile) {
                formData.append('files', avatarFile);
            }

            await updateProfile(formData).unwrap();
            toast.success('Profile updated successfully');
            setIsEditingDetails(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.data?.message || 'Failed to update profile');
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        try {
            await changePassword({
                passwordCurrent: passwordForm.currentPassword,
                password: passwordForm.newPassword,
                passwordConfirm: passwordForm.confirmPassword
            }).unwrap();

            toast.success('Password changed successfully');
            setIsEditingPassword(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Failed to change password:', error);
            toast.error(error.data?.message || 'Failed to change password');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account settings and preferences.</p>
            </div>

            {/* Main Content - Single Column */}
            <div className="space-y-8">

                {/* 1. Personal Details Section */}
                <section className="bg-white dark:bg-[#1b1c1d] rounded-2xl border border-gray-100 dark:border-white/10 p-8 shadow-sm">
                    <form onSubmit={handleSaveDetails}>
                        {/* Profile Header (Avatar + Info) */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-gray-100 dark:border-white/10 pb-8 mb-8">
                            {/* Avatar */}
                            <div className="relative group shrink-0">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1b1c1d] shadow-lg bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditingDetails && (
                                    <>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                        >
                                            <FiCamera className="w-8 h-8" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg border-2 border-white dark:border-[#1b1c1d] hover:bg-gray-900 transition-transform hover:scale-105"
                                        >
                                            <FiUpload className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* User Info & Quick Stats */}
                            <div className="flex-1 text-center sm:text-left pt-2">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {detailsForm.name || 'Admin User'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="capitalize px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-semibold">
                                        {user?.role}
                                    </span>
                                    <span>{detailsForm.email}</span>
                                </p>

                                {isEditingDetails && (
                                    <p className="text-xs text-gray-400">
                                        Allowed: JPG, PNG, GIF (Max 5MB)
                                    </p>
                                )}
                            </div>
                            {!isEditingDetails && (
                                <button
                                    onClick={() => setIsEditingDetails(true)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                    <FiEdit2 className="w-4 h-4 mr-2" />
                                    Edit Details
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={detailsForm.name}
                                        onChange={handleDetailsChange}
                                        disabled={!isEditingDetails}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={detailsForm.phoneNumber}
                                        onChange={handleDetailsChange}
                                        disabled={!isEditingDetails}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Email (Read Only - Full Width) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={detailsForm.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditingDetails && (
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelDetails}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-none disabled:opacity-70 cursor-pointer"
                                >
                                    {isUpdatingProfile ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    ) : (
                                        <FiSave className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </section>

                {/* 2. Security Section */}
                <section className="bg-white dark:bg-[#1b1c1d] rounded-2xl border border-gray-200 dark:border-white/10 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white">
                                <FiLock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password & Security</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and security preferences.</p>
                            </div>
                        </div>
                        {!isEditingPassword && (
                            <button
                                onClick={() => setIsEditingPassword(true)}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Change Password
                            </button>
                        )}
                    </div>

                    {isEditingPassword ? (
                        <form onSubmit={handleSavePassword} className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all dark:text-white"
                                        placeholder="Enter your current password"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all dark:text-white"
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black dark:focus:border-white transition-all dark:text-white"
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingPassword(false);
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-none disabled:opacity-70 cursor-pointer"
                                >
                                    {isChangingPassword ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    ) : (
                                        <FiSave className="w-4 h-4 mr-2" />
                                    )}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password is set and secure</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">Last changed recently</span>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default AdminProfile;
