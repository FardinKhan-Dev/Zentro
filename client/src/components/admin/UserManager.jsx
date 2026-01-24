import { useState } from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '../../features/admin/adminApi';
import { format } from 'date-fns';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FiFilter } from '@react-icons/all-files/fi/FiFilter';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiEdit2 } from '@react-icons/all-files/fi/FiEdit2';
import { FiShield } from '@react-icons/all-files/fi/FiShield';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiCheckCircle } from '@react-icons/all-files/fi/FiCheckCircle';
import { FiXCircle } from '@react-icons/all-files/fi/FiXCircle';
import { FiMail } from '@react-icons/all-files/fi/FiMail';
import { FiLoader } from '@react-icons/all-files/fi/FiLoader';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiUserCheck } from '@react-icons/all-files/fi/FiUserCheck';
import { FiUserPlus } from '@react-icons/all-files/fi/FiUserPlus';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';

const UserManager = () => {
    const [roleFilter, setRoleFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });

    const { data: userData, isLoading } = useGetAllUsersQuery({
        role: roleFilter || undefined,
        page,
        limit: 10,
        search: searchTerm || undefined,
    });

    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [deleteUser] = useDeleteUserMutation();

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateRole({ userId, role: newRole }).unwrap();
            toast.success('User role updated successfully');
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error(`Failed to update role: ${error.message}`);
        }
    };

    const handleDeleteUser = async () => {
        if (deleteModal.userId) {
            try {
                await deleteUser(deleteModal.userId).unwrap();
                toast.success('User deleted successfully');
                if (selectedUser) setSelectedUser(null);
                setDeleteModal({ isOpen: false, userId: null, userName: '' });
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error(`Failed to delete user: ${error.message}`);
            }
        }
    };

    const roles = ['user', 'admin'];
    const users = userData?.data?.users || [];
    const stats = userData?.data?.stats;
    const pagination = userData?.data?.pagination;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    User Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    Manage your users base and permissions
                </p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiUsers className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiUsers className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Total Users
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{stats.totalUsers}</h3>
                            <p className="text-blue-100 text-sm mt-1 font-medium">All registered accounts</p>
                        </div>
                    </div>

                    {/* Verified Users */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiUserCheck className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiUserCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Verified
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{stats.verifiedUsers}</h3>
                            <p className="text-emerald-100 text-sm mt-1 font-medium">Email confirmed</p>
                        </div>
                    </div>

                    {/* New Users */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiUserPlus className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiUserPlus className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    New Users
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{stats.newUsers}</h3>
                            <p className="text-purple-100 text-sm mt-1 font-medium">Joined last 30 days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white/80 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                    />
                </div>
                <div className="relative w-full md:w-64 shadow-sm rounded-xl">
                    <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="text-gray-500 w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm appearance-none cursor-pointer dark:text-white"
                    >
                        <option value="" className="dark:bg-gray-900">All Roles</option>
                        {roles.map((role) => (
                            <option key={role} value={role} className="dark:bg-gray-900">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <FiLoader className="w-12 h-12 text-black dark:text-white animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <FiUser className="h-full w-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {users.map((user, index) => (
                                    user.role !== 'admin' && (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {(page - 1) * 10 + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                                        {user.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                                            <FiMail className="w-3 h-3 mr-1.5 opacity-70" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${user.role === 'admin'
                                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                                    }`}>
                                                    {user.role === 'admin' ? <FiShield className="w-3 h-3 mr-1.5" /> : <FiUser className="w-3 h-3 mr-1.5" />}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isVerified ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                                        <FiCheckCircle className="w-3 h-3 mr-1.5" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                        <FiXCircle className="w-3 h-3 mr-1.5" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all shadow-sm"
                                                    title="Manage User"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination style update */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Manage User Modal - Updated styles */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-white/10">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage User</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update details or permissions</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full transition-colors"
                                >
                                    <FiXCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-gray-800 to-black dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {selectedUser.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">Status</div>
                                        <div className="flex items-center font-medium">
                                            {selectedUser.isVerified ? (
                                                <span className="text-green-600 dark:text-green-400 flex items-center"><FiCheckCircle className="mr-1.5" /> Verified</span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400 flex items-center"><FiXCircle className="mr-1.5" /> Pending</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">Joined</div>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {format(new Date(selectedUser.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role Assignment
                                    </label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => handleRoleUpdate(selectedUser._id, e.target.value)}
                                        disabled={isUpdating}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-white"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role} className="dark:bg-gray-900">
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Admins have full access to the dashboard.
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, userId: selectedUser._id, userName: selectedUser.name })}
                                        className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <FiTrash2 className="mr-2" />
                                        Delete User
                                    </button>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold text-sm"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteUser}
                title="Delete User?"
                message={`Are you sure you want to delete ${deleteModal.userName}? This action cannot be undone.`}
                confirmText="Delete User"
                type="danger"
            />
        </div>
    );
};

export default UserManager;
