import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingCart, FiUsers, FiPieChart, FiSettings, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutMutation] = useLogoutMutation();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: FiGrid },
        { name: 'Products', href: '/admin/products', icon: FiBox },
        { name: 'Orders', href: '/admin/orders', icon: FiShoppingCart },
        { name: 'Customers', href: '/admin/users', icon: FiUsers },
        { name: 'Analytics', href: '/admin/analytics', icon: FiPieChart },
        { name: 'Settings', href: '/admin/settings', icon: FiSettings },
    ];

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#121212] border-r border-gray-100 dark:border-white/10
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-8 border-b border-gray-100 dark:border-white/10">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold mr-3 shadow-lg shadow-gray-200 dark:shadow-none transition-colors">
                        Z
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">Zentro</span>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`
                                    flex items-center px-6 py-3.5 text-sm font-medium rounded-xl transition-all duration-200
                                    ${active
                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className={`w-5 h-5 mr-4 ${active ? 'text-white dark:text-black' : 'text-gray-400 group-hover:text-black dark:group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 dark:border-white/10">
                    <button
                        onClick={async () => {
                            try {
                                await logoutMutation().unwrap();
                            } catch (err) {
                                console.error('Logout error:', err);
                            } finally {
                                dispatch(logout());
                                navigate('/');
                            }
                        }}
                        className="flex items-center w-full px-6 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <FiLogOut className="w-5 h-5 mr-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;