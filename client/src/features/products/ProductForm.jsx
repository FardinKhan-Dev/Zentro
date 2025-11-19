import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetProductQuery, useCreateProductMutation, useUpdateProductMutation } from './productApi';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Queries & Mutations
  const { data: productData } = useGetProductQuery(id, { skip: !id });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'general',
    stock: '',
    featured: false,
    metadata: {},
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && productData?.data) {
      const product = productData.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'general',
        stock: product.stock || '',
        featured: product.featured || false,
        metadata: product.metadata || {},
      });
    }
  }, [isEditMode, productData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors({ ...errors, [name]: '' });
  };

  const handleMetadataChange = (key, value) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [key]: value },
    });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = 'Valid stock number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', parseFloat(formData.price));
      submitData.append('category', formData.category);
      submitData.append('stock', parseInt(formData.stock, 10));
      submitData.append('featured', formData.featured);
      submitData.append('metadata', JSON.stringify(formData.metadata));

      files.forEach((file) => {
        submitData.append('files', file);
      });

      if (isEditMode) {
        await updateProduct({ id, formData: submitData }).unwrap();
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(submitData).unwrap();
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate(isEditMode ? `/products/${id}` : '/products');
      }, 1500);
    } catch (err) {
      setErrors({ submit: err?.data?.message || 'Error submitting form' });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={isEditMode ? `/products/${id}` : '/products'} className="text-blue-600 hover:text-blue-800 hover:underline mb-8 inline-block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg">
          {success}
        </div>
      )}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
        {/* Basic Info */}
        <fieldset className="border border-gray-300 rounded-lg p-6">
          <legend className="text-lg font-semibold text-gray-800 px-3 -ml-3">Basic Information</legend>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {errors.name && <span className="text-red-600 text-sm mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label htmlFor="description" className="block font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block font-semibold text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.price
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                {errors.price && <span className="text-red-600 text-sm mt-1 block">{errors.price}</span>}
              </div>

              <div>
                <label htmlFor="stock" className="block font-semibold text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.stock
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                {errors.stock && <span className="text-red-600 text-sm mt-1 block">{errors.stock}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="general">General</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div className="flex items-center">
                <label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="border border-gray-300 rounded-lg p-6">
          <legend className="text-lg font-semibold text-gray-800 px-3 -ml-3">Images</legend>

          <div className="space-y-4">
            <div>
              <label htmlFor="files" className="block font-semibold text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                id="files"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
              />
              {files.length > 0 && (
                <p className="text-green-600 text-sm mt-2">{files.length} file(s) selected</p>
              )}
            </div>

            {isEditMode && productData?.data?.images && productData.data.images.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-3">Current Images:</p>
                <div className="flex gap-3 flex-wrap">
                  {productData.data.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Product ${idx + 1}`}
                      className="w-24 h-24 object-cover border border-gray-300 rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </fieldset>

        {/* Metadata */}
        <fieldset className="border border-gray-300 rounded-lg p-6">
          <legend className="text-lg font-semibold text-gray-800 px-3 -ml-3">
            Additional Metadata (Optional)
          </legend>

          <div>
            <label className="block font-semibold text-gray-700 mb-4">Custom Fields</label>
            <div className="space-y-3">
              {Object.entries(formData.metadata).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleMetadataChange(key, e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newMeta = { ...formData.metadata };
                      delete newMeta[key];
                      setFormData({ ...formData, metadata: newMeta });
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
          <Link
            to={isEditMode ? `/products/${id}` : '/products'}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
