import React, { useState } from 'react';
import { useGetProductsQuery } from '../../features/products/productApi';
import ProductCard from './ProductCard';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';

const ProductList = () => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    q: ''
  });
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const limit = 12;

  const { data, isLoading, error } = useGetProductsQuery({
    ...filters,
    page,
    limit,
  });

  const products = data?.data || [];
  const pagination = data?.meta || {};

  // Synced with ProductManager categories
  const categories = [
    { id: 'tropical', name: 'Tropical Plants' },
    { id: 'air-purifying', name: 'Air Purifying' },
    { id: 'vining', name: 'Vining & Trailing' },
    { id: 'shade', name: 'Low Light / Shade' },
    { id: 'tabletop', name: 'Tabletop / Desk' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Best Selling' },
  ];

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-linear-to-r from-[#2E7D32] to-[#4caf50] py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container-custom relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display tracking-tight border-b-4 border-[#2E7D32] inline-block pb-2">
              Our Collection
            </h1>
            <p className="text-green-50 text-xl max-w-xl leading-relaxed">
              Discover sustainable and eco-friendly plants curated for your modern lifestyle.
            </p>
          </div>
          {/* Search Bar in Header */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              placeholder="Find your perfect plant..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-green-100 focus:outline-none focus:bg-white/20 focus:ring-4 focus:ring-white/10 transition-all"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-100 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="py-12 px-4 lg:pr-12 lg:pl-2">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-zinc-900 rounded-xl font-semibold text-gray-800 dark:text-gray-200"
          >
            <FiFilter /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-3xl">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between group ${filters.category === ''
                      ? 'bg-[#2E7D32] text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm'
                      }`}
                  >
                    All Plants
                    {filters.category === '' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange('category', cat.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between group ${filters.category === cat.id
                        ? 'bg-[#2E7D32] text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm'
                        }`}
                    >
                      {cat.name}
                      {filters.category === cat.id && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-3xl">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Price Range</h3>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full pl-6 pr-3 py-2 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-800 dark:text-white focus:border-[#2E7D32]/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full pl-6 pr-3 py-2 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-800 dark:text-white focus:border-[#2E7D32]/20 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'newest', q: '' });
                  setPage(1);
                }}
                className="w-full py-3 border-2 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sort & Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Found <span className="text-gray-900 dark:text-white font-bold">{pagination.total || 0}</span> products
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2 rounded-lg border-none bg-white dark:bg-zinc-800 font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-[#2E7D32]/20 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-3xl h-[450px] animate-pulse" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center">
                <p className="text-red-800 font-semibold text-lg">{error?.data?.message || 'Failed to load products'}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex justify-center items-center w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full mb-6">
                      <FiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No plants found</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any products matching your current filters. Try adjusting your search or categories.</p>
                    <button
                      onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'newest', q: '' })}
                      className="px-8 py-3 bg-[#2E7D32] text-white font-semibold rounded-xl hover:bg-[#1b5e20] transition-colors shadow-lg shadow-green-200"
                    >
                      View All Plants
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-[#2E7D32] hover:text-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                    >
                      &lt;
                    </button>

                    <div className="flex gap-2">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all ${page === i + 1
                            ? 'bg-[#2E7D32] text-white shadow-lg shadow-green-200 scale-110'
                            : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-[#2E7D32] hover:text-[#2E7D32] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
