import { useState, useEffect } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../features/admin/adminApi';
import { format } from 'date-fns';
import { FiSearch, FiFilter, FiDownload, FiX, FiChevronLeft, FiChevronRight, FiCheck, FiClock, FiTruck, FiPackage, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { MdPendingActions } from "react-icons/md";
import { toast } from 'react-hot-toast';

const OrderManager = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const { data, isLoading } = useGetAllOrdersQuery({
        status: statusFilter || undefined,
        page,
        limit: 20,
        search: searchTerm || undefined,
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        if (selectedOrder) {
            setTrackingNumber(selectedOrder.trackingNumber || '');
            setStatusToUpdate(selectedOrder.orderStatus);
        }
    }, [selectedOrder]);

    const handleStatusUpdate = async (orderId, { status, paymentStatus, trackingVal }) => {
        try {
            await updateStatus({
                orderId,
                status: status || undefined,
                paymentStatus,
                trackingNumber: trackingVal
            }).unwrap();

            if (!paymentStatus) {
                setSelectedOrder(null);
            } else {
                setSelectedOrder(null);
            }
            toast.success('Order updated successfully!');
        } catch (error) {
            toast.error(`Failed to update order: ${error.message}`);
        }
    };

    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Status styles matching User Dashboard
    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-100 ring-yellow-500/10',
            processing: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10',
            shipped: 'bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/10',
            delivered: 'bg-green-50 text-green-700 border-green-100 ring-green-500/10',
            cancelled: 'bg-red-50 text-red-700 border-red-100 ring-red-500/10',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiClock className="w-3.5 h-3.5" />,
            processing: <FiPackage className="w-3.5 h-3.5" />,
            shipped: <FiTruck className="w-3.5 h-3.5" />,
            delivered: <FiCheck className="w-3.5 h-3.5" />,
            cancelled: <FiX className="w-3.5 h-3.5" />,
        };
        return icons[status] || <FiAlertCircle className="w-3.5 h-3.5" />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Order Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Monitor orders, track shipments, and manage returns</p>
                </div>
                <button
                    onClick={() => toast.success('Exporting orders to CSV...')}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:bg-gray-900 dark:hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <FiDownload /> Export Details
                </button>
            </div>

            {/* Stats Overview */}
            {data?.data?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Orders */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiPackage className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiPackage className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Total Orders
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.totalOrders}</h3>
                            <p className="text-blue-100 text-sm mt-1 font-medium">All time orders</p>
                        </div>
                    </div>

                    {/* Pending Payment */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiDollarSign className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiDollarSign className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Pending Payment
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.pendingPayment}</h3>
                            <p className="text-amber-100 text-sm mt-1 font-medium">Action required</p>
                        </div>
                    </div>

                    {/* Processing */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiClock className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiClock className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Processing
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.processing}</h3>
                            <p className="text-violet-100 text-sm mt-1 font-medium">In progress</p>
                        </div>
                    </div>

                    {/* Shipped */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiTruck className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiTruck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Shipped
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.shipped}</h3>
                            <p className="text-cyan-100 text-sm mt-1 font-medium">On the way</p>
                        </div>
                    </div>

                    {/* Delivered */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiCheck className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Delivered
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.delivered}</h3>
                            <p className="text-emerald-100 text-sm mt-1 font-medium">Completed orders</p>
                        </div>
                    </div>

                    {/* Cancelled */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <FiX className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <FiX className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    Cancelled
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{data.data.stats.cancelled}</h3>
                            <p className="text-rose-100 text-sm mt-1 font-medium">Returned/Failed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white/80 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-xl flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                    />
                </div>
                <div className="relative w-full md:w-64 shadow-sm rounded-xl">
                    <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-gray-500 w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm appearance-none cursor-pointer dark:text-white"
                    >
                        <option value="" className="dark:bg-gray-900">All Statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status} className="dark:bg-gray-900">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden backdrop-blur-xl">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-gray-100 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
                    </div>
                ) : data?.data?.orders?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-white/10">
                                <thead className="bg-gray-50/50 dark:bg-white/5">
                                    <tr>
                                        {['S.No', 'Order', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map((header) => (
                                            <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-transparent">
                                    {data.data.orders.map((order, index) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 dark:text-gray-400">
                                                #{(page - 1) * 20 + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">#{order.orderNumber}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.items?.length || 0} items</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{order.user?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.user?.email || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount?.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${order.paymentStatus === 'paid'
                                                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${getStatusStyle(order.orderStatus)}`}>
                                                    {getStatusIcon(order.orderStatus)}
                                                    <span className="capitalize">{order.orderStatus}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <MdPendingActions size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {data?.data?.pagination && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/5">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing <span className="font-bold text-gray-900 dark:text-white">{(page - 1) * 20 + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(page * 20, data.data.pagination.total)}</span> of <span className="font-bold text-gray-900 dark:text-white">{data.data.pagination.total}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600 dark:text-gray-300"
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= data.data.pagination.pages}
                                        className="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600 dark:text-gray-300"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <FiSearch size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Order Management Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-white/10 no-scrollbar">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Manage Order #{selectedOrder.orderNumber}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View details and update status</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Status Section */}
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10">
                                <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                    Update Status
                                </label>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <select
                                                value={statusToUpdate}
                                                onChange={(e) => setStatusToUpdate(e.target.value)}
                                                disabled={isUpdating}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium appearance-none cursor-pointer dark:text-white"
                                            >
                                                {statuses.map((status) => (
                                                    <option key={status} value={status} className="dark:bg-gray-800">
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <FiChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Tracking Number Input */}
                                    {(statusToUpdate === 'shipped') && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Tracking Number</label>
                                            <input
                                                type="text"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                placeholder="Enter tracking number"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder._id, { status: statusToUpdate, trackingVal: trackingNumber })}
                                            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm shadow-sm"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Customer
                                    </h3>
                                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Name</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.user?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Email</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">ID</p>
                                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{selectedOrder.user?._id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Payment
                                    </h3>
                                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Method</p>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">{selectedOrder.paymentMethod || 'Card'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Status</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold capitalize ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                    {selectedOrder.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Total Amount</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">${selectedOrder.totalAmount?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Order Items
                                </h3>
                                <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-white/10">
                                        <thead className="bg-gray-50/50 dark:bg-white/5">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Product</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/10 bg-white dark:bg-transparent">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item?.name || 'Unknown'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
