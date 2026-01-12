import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../features/products/productApi';
import ProductCard from '../products/ProductCard';
import Button from '../common/Button';

const FeaturedProducts = () => {
  const { data, isLoading } = useGetProductsQuery({ limit: 6 });
  // const products = data?.data?.products || [];
  const products = [
    { id: 1, name: 'Dracaena', price: 80.00, rating: 4, image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09', highlight: false },
    { id: 2, name: 'Dracaena', price: 80.00, rating: 5, image: 'https://atlas-content-cdn.pixelsquid.com/stock-images/potted-plant-flower-pot-mdm41mF-600.jpg', highlight: true },
    { id: 3, name: 'Dracaena', price: 80.00, rating: 4, image: 'https://atlas-content-cdn.pixelsquid.com/stock-images/potted-plant-flower-pot-y1Md6P7-600.jpg', highlight: false },
    { id: 4, name: 'Dracaena', price: 80.00, rating: 4, image: 'https://atlas-content-cdn.pixelsquid.com/stock-images/potted-plant-flower-pot-K60zrNB-600.jpg', highlight: false },
    { id: 5, name: 'Dracaena', price: 80.00, rating: 4, image: 'https://png.pngtree.com/png-vector/20240905/ourmid/pngtree-unreal-engine-5-style-game-asset-a-unique-plant-pot-white-png-image_13754661.png', highlight: false },
    { id: 6, name: 'Dracaena', price: 80.00, rating: 4, image: 'https://png.pngtree.com/png-vector/20240309/ourmid/pngtree-home-plant-in-pot-cutout-png-image_11899655.png', highlight: false },
  ];

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
          <span className="px-4 py-2 bg-white/70 dark:bg-gray-900/60 text-[#2E7D32] rounded-full text-sm font-medium">
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
