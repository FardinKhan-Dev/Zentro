import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCheck, FiX, FiPackage, FiBarChart2 } from 'react-icons/fi';
import { useGetProductsQuery, useDeleteProductMutation } from '../../features/products/productApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';

const ProductManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
    const limit = 10;

    const { data, isLoading } = useGetProductsQuery({
        page,
        limit,
        q: searchTerm,
        category: categoryFilter
    });

    const [deleteProduct] = useDeleteProductMutation();

    const handleDeleteProduct = async () => {
        if (deleteModal.productId) {
            try {
                await deleteProduct(deleteModal.productId).unwrap();
                toast.success('Product deleted successfully');
                setDeleteModal({ isOpen: false, productId: null, productName: '' });
            } catch (err) {
                console.error('Failed to delete product:', err);
                toast.error('Failed to delete product');
            }
        }
    };

    const products = data?.data || [];
    const stats = data?.stats || { totalProducts: 0, inStock: 0, outOfStock: 0 };
    const totalPages = data?.meta?.pages || data?.page || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold dark:text-white text-gray-900">Product Management</h1>
                    <p className="text-xl text-gray-500 mt-1 dark:text-gray-400">Manage your product inventory</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                    <FiPlus />
                    Add Product
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <FiPackage className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <FiBarChart2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                Total Products
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold tracking-tight">{stats.totalProducts}</h3>
                        <p className="text-blue-100 text-sm mt-1 font-medium">Active inventory</p>
                    </div>
                </div>

                {/* In Stock */}
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
                                In Stock
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold tracking-tight">{stats.inStock}</h3>
                        <p className="text-emerald-100 text-sm mt-1 font-medium">Ready to ship</p>
                    </div>
                </div>

                {/* Out of Stock */}
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
                                Out of Stock
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold tracking-tight">{stats.outOfStock}</h3>
                        <p className="text-rose-100 text-sm mt-1 font-medium">Restock needed</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                    />
                </div>
                <div className="relative w-full md:w-64 shadow-sm rounded-xl">
                    <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="text-gray-500 w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm appearance-none cursor-pointer dark:text-white"
                    >
                        <option className="dark:bg-gray-900" value="">All Categories</option>
                        <option className="dark:bg-gray-900" value="tropical">Tropical Plants</option>
                        <option className="dark:bg-gray-900" value="air-purifying">Air-Purifying Plants</option>
                        <option className="dark:bg-gray-900" value="vining">Vining & Trailing Plants</option>
                        <option className="dark:bg-gray-900" value="shade">Shade-Loving / Low-Light Plants</option>
                        <option className="dark:bg-gray-900" value="tabletop">Tabletop / Desk Plants</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="backdrop-blur-xl bg-white/5 border border-black/10 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/5 dark:bg-white/5">
                                <tr>
                                    {['SL.No', 'Product', 'Category', 'Price', 'Stock', 'Featured', 'Status', 'Actions'].map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                {products.map((product, index) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors duration-200">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            #{(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg dark:bg-gray-900 bg-gray-100 overflow-hidden border border-white/10 mr-3">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-gray-100">{product.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {product._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100  capitalize">{product.category}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">${product.price?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                                            <div className="flex flex-col text-gray-800 dark:text-gray-100">
                                                <span>{product.stock} total</span>
                                                <span className="text-xs text-gray-500">{product.reservedStock > 0 ? `${product.reservedStock} reserved` : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.featured ? (
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Featured</span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${product.stock > 0
                                                ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="inline-flex p-2 text-blue-900 hover:bg-blue-400 dark:text-blue-700 hover:dark:bg-blue-300 rounded-lg transition-colors"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, productId: product._id, productName: product.name })}
                                                className="inline-flex p-2 text-red-900 hover:bg-red-400 dark:text-red-700 hover:dark:bg-red-300 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiSearch className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">No products found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or add a new product.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/10 hover:bg-white/20 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/10 hover:bg-white/20 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteProduct}
                title="Delete Product?"
                message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
                confirmText="Delete Product"
                type="danger"
            />
        </div>
    );
};

export default ProductManager;
