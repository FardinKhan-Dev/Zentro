import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productApi';
import ProductCard from '../products/ProductCard';
import Button from '../common/Button';

const FeaturedProducts = () => {
  // Fetch top-rated products (or featured products)
  const { data, isLoading } = useGetProductsQuery({
    featured: true,  // Only featured products
    sort: 'rating',  // Sort by rating
    limit: 6
  });
  const products = data?.data || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Best Products</h2>
            <p className="text-gray-600 mt-2">Discover our most popular items</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto mt-24 text-center">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="px-4 py-2 bg-white/95 dark:bg-gray-900/90 text-[#2E7D32] rounded-full text-sm font-medium">
            ⭐ Best Sellers
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-200">Our Best Products</h2>
        <p className="text-gray-600 mt-2 dark:text-gray-400">Handpicked favorites loved by our customers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} highlight={product.highlight} />
        ))}
      </div>

      <Button variant="primary" className='mt-12'>
        View All Plants
      </Button>
    </section>
  );
};

export default FeaturedProducts;
