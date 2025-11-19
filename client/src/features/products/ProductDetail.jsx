import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProductQuery, useDeleteProductMutation } from './productApi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetProductQuery(id);
  const [deleteProduct] = useDeleteProductMutation();

  if (isLoading) return <div className="p-5">Loading product...</div>;
  if (error) return <div className="p-5 text-red-600">Error loading product</div>;

  const product = data?.data;
  if (!product) return <div className="p-5 text-red-600">Product not found</div>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        alert('Product deleted successfully');
        navigate('/products');
      } catch (err) {
        alert('Error deleting product: ' + (err?.data?.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/products" className="text-blue-600 hover:text-blue-800 hover:underline mb-8 inline-block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-lg border border-gray-200 p-8">
        {/* Images Section */}
        <div className="flex flex-col gap-4">
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-col gap-4">
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full max-h-96 object-contain border border-gray-200 rounded-lg bg-gray-50"
              />
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-20 h-20 object-cover border border-gray-200 rounded cursor-pointer hover:border-blue-500 hover:scale-105 transition"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
              No images available
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>

          {product.category && (
            <span className="inline-block w-fit bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>
          )}

          <div className="border-t border-b border-gray-200 py-4">
            <h2 className="text-4xl font-bold text-green-600">${product.price.toFixed(2)}</h2>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Stock:</span>
              <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </span>
            </div>
            {product.featured && (
              <div className="inline-block w-fit bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium">
                ⭐ Featured
              </div>
            )}
          </div>

          {product.metadata && Object.keys(product.metadata).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Additional Info</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(product.metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <dt className="font-semibold text-gray-700">{key}</dt>
                    <dd className="text-gray-600">{String(value)}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <Link
              to={`/products/${product._id}/edit`}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold text-center"
            >
              Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Delete Product
            </button>
          </div>

          {product.createdAt && (
            <p className="text-sm text-gray-500 mt-4">
              Added: {new Date(product.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
