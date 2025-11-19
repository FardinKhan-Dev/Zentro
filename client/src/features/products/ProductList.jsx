import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from './productApi';

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit] = useState(20);

  const { data, isLoading, error } = useGetProductsQuery({
    page,
    limit,
    q: searchQuery,
    category: selectedCategory,
  });

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, limit, total: 0 };
  const totalPages = Math.ceil(meta.total / limit);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  if (isLoading) return <div className="p-5">Loading products...</div>;
  if (error) return <div className="p-5 text-red-600">Error loading products</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Products</h1>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="home">Home & Garden</option>
          <option value="sports">Sports</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Admin Create Button */}
      <div className="mb-8">
        <Link
          to="/products/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
        >
          + Add Product
        </Link>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-300"
            >
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-48 object-cover bg-gray-100"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  ${product.price.toFixed(2)}
                </p>
                {product.category && (
                  <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                )}
                <p className="text-sm text-gray-600 mb-4">
                  Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}
                </p>
                <Link
                  to={`/products/${product._id}`}
                  className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-center font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-gray-300">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
