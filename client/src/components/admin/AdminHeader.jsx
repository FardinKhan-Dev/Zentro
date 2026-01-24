import React, { useState, useRef, useEffect } from 'react';
import { FiMenu } from '@react-icons/all-files/fi/FiMenu';
import { FiBell } from '@react-icons/all-files/fi/FiBell';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiSun } from '@react-icons/all-files/fi/FiSun';
import { FiMoon } from '@react-icons/all-files/fi/FiMoon';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation
} from '../../features/notifications/notificationApi';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { formatDistanceToNow } from 'date-fns';

const AdminHeader = ({ onMenuClick }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useOnClickOutside(profileRef, () => setIsProfileOpen(false));
    useOnClickOutside(notifRef, () => setIsNotifOpen(false));

    // Notifications Logic
    const { data: response, isLoading } = useGetNotificationsQuery();
    const notifications = response?.data?.notifications || [];

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    // Listen for real-time updates
    useSocket();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.success('Logged out successfully');
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleMarkAsRead = (id) => {
        markAsRead(id);
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    return (
        <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-white/10 h-16 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hello, {user?.name.split(' ')[0]} 👋</h1>

                <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-black/20 px-4 py-2 rounded-lg border border-transparent focus-within:border-[#4CAF50] transition-colors">
                    <FiSearch className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm text-gray-700 dark:text-gray-200 w-64 placeholder-gray-400 focus:outline-none"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                >
                    {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                    >
                        <FiBell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1b1c1d]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#252627] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs text-[#4CAF50] hover:text-[#388E3C] font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif._id}
                                                className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                                onClick={() => handleMarkAsRead(notif._id)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 rounded-full transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold shadow-sm">
                            {user?.avatar ? (
                                <img src={user?.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                user?.name?.[0]?.toUpperCase()
                            )}
                        </div>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#252627] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
                            >
                                <div className="p-2 space-y-1">
                                    <Link
                                        to="/admin/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <FiUser className="w-4 h-4" />
                                        Profile
                                    </Link>
                                    <Link
                                        to="/admin/settings"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <FiSettings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
