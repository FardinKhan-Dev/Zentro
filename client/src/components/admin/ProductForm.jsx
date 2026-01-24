import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from '@react-icons/all-files/fi/FiArrowLeft';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { FiImage } from '@react-icons/all-files/fi/FiImage';
import { FiCpu } from '@react-icons/all-files/fi/FiCpu';
import { FiTag } from '@react-icons/all-files/fi/FiTag';
import { FiDollarSign } from '@react-icons/all-files/fi/FiDollarSign';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';
import { toast } from 'react-hot-toast';
import { useGetProductQuery, useCreateProductMutation, useUpdateProductMutation } from '../../features/products/productApi';

import { useGenerateDescriptionMutation, useGenerateTagsMutation } from '../../features/admin/adminApi';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const { data: product, isLoading: isLoadingProduct } = useGetProductQuery(id, { skip: !isEditMode });
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    // AI Mutations
    const [generateDescription, { isLoading: isGeneratingDesc }] = useGenerateDescriptionMutation();
    const [generateTags, { isLoading: isGeneratingTags }] = useGenerateTagsMutation();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        lowStockThreshold: 10,
        featured: false,
        images: [], // Existing images from server
        tags: [],
    });

    // New files selected by user (not yet uploaded)
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (product?.data) {
            setFormData({
                name: product.data.name,
                description: product.data.description,
                price: product.data.price,
                category: product.data.category,
                stock: product.data.stock,
                lowStockThreshold: product.data.lowStockThreshold || 10,
                featured: product.data.featured || false,
                images: product.data.images || [],
                tags: product.data.tags || [],
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const files = e.target.files || e.dataTransfer?.files;
        if (!files) return;

        const newFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (newFiles.length + selectedFiles.length + formData.images.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }


        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveNewImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileSelect(e);
    };

    const handleAIEnhance = async (type) => {
        if (!formData.name) {
            toast.error('Please enter a product name first');
            return;
        }


        try {
            if (type === 'description') {
                const res = await generateDescription({
                    name: formData.name,
                    category: formData.category,
                    features: [formData.category] // Simple feature extraction
                }).unwrap();
                setFormData(prev => ({ ...prev, description: res.data.description }));
            } else if (type === 'tags') {
                const res = await generateTags({
                    name: formData.name,
                    description: formData.description
                }).unwrap();
                setFormData(prev => ({ ...prev, tags: res.data.tags }));
            }
        } catch (err) {
            toast.error('AI Generation failed: ' + (err.data?.message || err.message));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Build FormData for file upload
            const submitData = new FormData();

            // Append text fields
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('price', formData.price);
            submitData.append('category', formData.category);
            submitData.append('stock', formData.stock);
            submitData.append('lowStockThreshold', formData.lowStockThreshold);
            submitData.append('featured', formData.featured);
            submitData.append('tags', JSON.stringify(formData.tags));

            // Append existing images (for edit mode - to keep them)
            if (isEditMode && formData.images.length > 0) {
                submitData.append('existingImages', JSON.stringify(formData.images));
            }

            // Append new files
            selectedFiles.forEach(file => {
                submitData.append('files', file);
            });

            if (isEditMode) {
                await updateProduct({ id, formData: submitData }).unwrap();
            } else {
                await createProduct(submitData).unwrap();
            }
            navigate('/admin/products');
        } catch (err) {
            toast.error('Failed to save product: ' + (err.data?.message || err.message));
        }
    };


    if (isLoadingProduct) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32]"></div>
        </div>
    );

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditMode ? 'Edit Product' : 'Create Product'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {isEditMode ? `Update ${formData.name || 'product'}` : 'Add a new item to your inventory'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Unified Card Container */}
                <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">

                    {/* 1. Basic Information Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <FiLayers className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                                    placeholder="e.g. Monstera Deliciosa"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm appearance-none cursor-pointer dark:text-white"
                                        required
                                    >
                                        <option value="" className="dark:bg-gray-800">Select Category</option>
                                        <option value="tropical" className="dark:bg-gray-800">Tropical Plants</option>
                                        <option value="air-purifying" className="dark:bg-gray-800">Air-Purifying Plants</option>
                                        <option value="vining" className="dark:bg-gray-800">Vining & Trailing Plants</option>
                                        <option value="shade" className="dark:bg-gray-800">Shade-Loving / Low-Light Plants</option>
                                        <option value="tabletop" className="dark:bg-gray-800">Tabletop / Desk Plants</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Visibility</label>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5 cursor-pointer hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all h-[46px]">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.featured ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-white dark:bg-transparent border-gray-300 dark:border-white/30'
                                        }`}>
                                        {formData.featured && <FiCheck className="w-3.5 h-3.5 text-white dark:text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Feature on Homepage</span>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-gray-900 dark:text-white">Description</label>
                                    <button
                                        type="button"
                                        onClick={() => handleAIEnhance('description')}
                                        disabled={isGeneratingDesc}
                                        className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <FiCpu className="w-3.5 h-3.5" />
                                        {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm resize-none dark:text-white placeholder-gray-400"
                                    placeholder="Detailed description of the product..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Media Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <FiImage className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Images</h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                ({formData.images.length + selectedFiles.length}/10 images)
                            </span>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-8 text-center hover:border-black dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer bg-white dark:bg-white/5 group"
                        >
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                                <FiUploadCloud className="w-6 h-6 text-gray-400 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Click or drag images to upload</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG or GIF (max. 5MB each, up to 10 images)</p>
                        </div>

                        {/* Image previews */}
                        {(formData.images.length > 0 || selectedFiles.length > 0) && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 mt-6">
                                {/* Existing images from server */}
                                {formData.images.map((img, idx) => (
                                    <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-white dark:bg-white/5 shadow-sm">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(idx)}
                                                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded font-medium">
                                            Saved
                                        </div>
                                    </div>
                                ))}
                                {/* New files (local preview) */}
                                {selectedFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-white dark:bg-white/5 shadow-sm">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(idx)}
                                                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-medium">
                                            New
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Pricing & Inventory Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                <FiDollarSign className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pricing & Inventory</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Base Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-mono dark:text-white"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-mono dark:text-white"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Low Stock Alert</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-mono dark:text-white"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Tags Section */}
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <FiTag className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tags & Keywords</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAIEnhance('tags')}
                                disabled={isGeneratingTags}
                                className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <FiCpu className="w-3.5 h-3.5" />
                                {isGeneratingTags ? 'Generating...' : 'Generate AI Tags'}
                            </button>
                        </div>
                        <div className="relative">
                            <FiTag className="absolute left-4 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                name="tags"
                                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm dark:text-white placeholder-gray-400"
                                placeholder="indoor, large leaf, beginner friendly..."
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">Separate tags with commas for better search optimization.</p>
                    </div>
                    {/* Sticky Action Footer */}
                    <div className=" bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 p-4 z-50">
                        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:inline font-medium cursor-pointer">
                                {isEditMode ? 'Last saved recently' : 'Unsaved changes'}
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-8 py-2.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                >
                                    {isCreating || isUpdating ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default ProductForm;
