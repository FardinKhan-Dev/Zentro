import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productApi, useGetProductQuery, useDeleteProductMutation, useGetProductsQuery } from '../../features/products/productApi';
import { useSocket } from '../../hooks/useSocket';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';
import AddToCartButton from '../common/AddToCartButton';
import { useAddToCartMutation } from '../../features/cart/cartApi';

import { FiArrowLeft } from '@react-icons/all-files/fi/FiArrowLeft';
import { FiShoppingBag } from '@react-icons/all-files/fi/FiShoppingBag';
import { FiTruck } from '@react-icons/all-files/fi/FiTruck';
import { FiShield } from '@react-icons/all-files/fi/FiShield';
import { FiSun } from '@react-icons/all-files/fi/FiSun';
import { FiArrowRight } from '@react-icons/all-files/fi/FiArrowRight';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiEdit2 } from '@react-icons/all-files/fi/FiEdit2';
import ReviewForm from '../reviews/ReviewForm';
import ReviewList from '../reviews/ReviewList';
import { useGetReviewsQuery } from '../../features/reviews/reviewApi';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { data, isLoading, error } = useGetProductQuery(id);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reviews = [] } = useGetReviewsQuery(id);


  // Fetch related products
  const { data: relatedData } = useGetProductsQuery({
    category: data?.data?.category,
    limit: 4
  });
  const relatedProducts = relatedData?.data?.products?.filter(p => p._id !== id) || [];

  useEffect(() => {
    if (socket && isConnected && id) {
      socket.emit('inventory:subscribe', [id]);

      const handleInventoryUpdate = (update) => {
        if (update.productId === id) {
          dispatch(
            productApi.util.updateQueryData('getProduct', id, (draft) => {
              if (draft && draft.data) {
                draft.data.stock = update.newStock;
              }
            })
          );
        }
      };

      socket.on('inventory:update', handleInventoryUpdate);

      return () => {
        socket.emit('inventory:unsubscribe', [id]);
        socket.off('inventory:update', handleInventoryUpdate);
      };
    }
  }, [socket, isConnected, id, dispatch]);

  // Scroll active thumbnail into view
  useEffect(() => {
    // Only scroll if not the first image to prevent page jump on load
    if (selectedImage > 1) {
      const el = document.getElementById(`thumb-${selectedImage}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedImage]);

  const handleDelete = async () => {
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error('Error deleting product: ' + (err?.data?.message || 'Unknown error'));
    }
    setIsModalOpen(false);
  };




  const handleBuyNow = async () => {
    try {
      await addToCart({ productId: id, quantity }).unwrap();
      navigate('/checkout');
    } catch (err) {
      toast.error('Error processing buy now: ' + (err?.data?.message || 'Unknown error'));
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-xl w-32 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gray-200 h-[500px] rounded-3xl"></div>
              <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-xl w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded-xl w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-8">{error?.data?.message || 'Failed to load product details'}</p>
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E7D32] text-white rounded-xl font-semibold hover:bg-[#1b5e20] transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const product = data?.data;
  if (!product) return null;

  const images = product.images || [];
  const currentImage = images[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image';

  const categoryLabels = {
    'tropical': 'Tropical',
    'air-purifying': 'Air Purifying',
    'vining': 'Vining',
    'shade': 'Low Light',
    'tabletop': 'Tabletop'
  };

  return (
    <div className="min-h-screen font-sans flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-zinc-900 backdrop-blur-md border-b border-gray-100 dark:border-white/10 shrink-0 z-30">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#2E7D32] transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link to="/products" className="hover:text-[#2E7D32] transition-colors">Collection</Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-900 dark:text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="relative h-full px-4 md:px-8 pt-8 md:pt-12 pb-4">
          <div className="grid xl:grid-cols-2 gap-8 xl:gap-16 h-full items-start">

            {/* Left Column: Image (Fixed/Centered) */}
            <div className="relative h-full flex flex-col">
              <div className=" h-[380px] bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-8 flex items-center justify-center relative group overflow-hidden">
                <img
                  src={typeof currentImage === 'string' ? currentImage : currentImage.url}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Thumbnails Carousel */}
              {images.length > 0 && (
                <div className="relative mt-3 group/thumbnails">
                  <div
                    id="thumbnail-carousel"
                    className="flex gap-4 overflow-x-auto pb-2 shrink-0 scroll-smooth no-scrollbar px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        id={`thumb-${idx}`}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white dark:bg-zinc-900 shrink-0 ${selectedImage === idx
                          ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 shadow-md'
                          : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={typeof img === 'string' ? img : img.url}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Left Arrow */}
                  <button
                    onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#2E7D32] hover:scale-110 transition-all opacity-0 group-hover/thumbnails:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed z-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={() => setSelectedImage(prev => Math.min(images.length - 1, prev + 1))}
                    disabled={selectedImage === images.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#2E7D32] hover:scale-110 transition-all opacity-0 group-hover/thumbnails:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed z-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}

              {/* Features (Compact) */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <FiTruck className="w-5 h-5 text-[#2E7D32] mb-1" />
                  <span className="text-[8px] md:text-[10px] uppercase font-bold text-gray-600 tracking-wider">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <FiShield className="w-5 h-5 text-[#2E7D32] mb-1" />
                  <span className="text-[8px] md:text-[10px] uppercase font-bold text-gray-600 tracking-wider">Warranty</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <FiSun className="w-5 h-5 text-[#2E7D32] mb-1" />
                  <span className="text-[8px] md:text-[10px] uppercase font-bold text-gray-600 tracking-wider">Light Guide</span>
                </div>
              </div>
            </div>


            {/* Right Column: Details */}
            <div className="h-full pr-2 flex flex-col">

              {/* Category & Status */}
              <div className="flex items-center gap-3">
                {product.category && (
                  <span className="px-3 py-1 bg-green-50 text-[#2E7D32] rounded-full text-xs font-bold tracking-wide border border-green-100">
                    {categoryLabels[product.category] || product.category}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${product.stock > 0
                  ? 'bg-gray-50 text-gray-600 border-gray-100'
                  : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-700' : 'bg-red-500'}`}></span>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold pb-4 text-gray-900 dark:text-white font-display leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.averageRating} size="medium" />
                  <span className="text-gray-400 font-medium text-sm">({product.numReviews} reviews)</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#2E7D32]">${product.price.toFixed(2)}</span>
                  <span className="text-lg text-gray-400 line-through">${(product.price * 1.25).toFixed(2)}</span>
                  <span className="px-2 py-1 bg-green-100 text-[#2E7D32] text-xs font-bold rounded-md">-20% Off</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-green prose-sm max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-8 mt-6 xl:mt-auto">
                {product.stock > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Quantity */}
                    <div className="flex items-center justify-evenly bg-gray-50 dark:bg-zinc-800 rounded-xl p-1 border border-gray-200 dark:border-zinc-700 shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 hover:text-[#2E7D32] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 hover:text-[#2E7D32] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <AddToCartButton
                      productId={id}
                      quantity={quantity}
                      variant="ghost"
                      className="flex-1 bg-white dark:bg-transparent text-[#2E7D32] font-bold text-lg py-3 px-6 rounded-xl border-2 border-[#2E7D32] hover:bg-green-50 dark:hover:bg-green-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiShoppingBag className="w-5 h-5" /> Add to Cart
                    </AddToCartButton>
                    <button
                      onClick={handleBuyNow}
                      disabled={isAdding}
                      className="flex-[1.5] bg-[#2E7D32] text-white font-bold text-lg py-3 px-6 rounded-xl hover:bg-[#1b5e20] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAdding ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Buy Now - ${(product.price * quantity).toFixed(2)} <FiArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm">
                    Currently unavailable
                  </div>
                )}
              </div>

              {/* Admin Controls */}
              {user?.role === 'admin' && (
                <div className="bg-red-50/50 p-4 rounded-2xl border border-dashed border-red-200 mt-4">
                  <h3 className="font-bold text-red-900 mb-3 text-sm flex items-center gap-2">
                    Admin Zone
                  </h3>
                  <div className="flex gap-3">
                    <Link to={`/products/${product._id}/edit`} className="flex-1">
                      <Button variant="outline" size="medium" className="w-full bg-white hover:bg-red-50 border-red-200 text-red-700">
                        Edit
                      </Button>
                    </Link>
                    <div className="flex-1">
                      <Button
                        variant="danger"
                        size="medium"
                        onClick={() => setIsModalOpen(true)}
                        loading={isDeleting}
                        className="w-full"
                      >
                        Delete
                      </Button>

                    </div>
                  </div>
                </div>
              )}

              {/* Related Link - Footer of details */}
              {relatedProducts.length > 0 && (
                <div className="pt-8 mt-4 border-t border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Also Considered</p>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {relatedProducts.map(rp => (
                      <Link key={rp._id} to={`/products/${rp._id}`} className="shrink-0 w-24 group">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                          <img src={rp.images?.[0]?.url || rp.images?.[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{rp.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <div className="px-4 md:px-8 pt-8 md:pt-12 pb-4">
          <div className="flex items-center justify-between md:mb-8 mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Customer Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2 bg-[#2E7D32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition-colors"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Review Form (Toggleable) */}
          {showReviewForm && (
            <div className="mb-12 animate-in slide-in-from-top-4 duration-300 fade-in">
              {user ? (
                <ReviewForm
                  productId={id}
                  onReviewSubmitted={() => setShowReviewForm(false)}
                />
              ) : (
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl text-center border border-gray-100 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">Share your thoughts</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Please sign in to write a review for this product.
                  </p>
                  <Link to="/login">
                    <Button className="bg-[#2E7D32] hover:bg-[#1b5e20] text-white">
                      Sign In to Review
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-12">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl sticky top-24">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <div>
                    <RatingStars rating={product.averageRating || 0} size="large" />
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {reviews.length} reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <ReviewList
                reviews={reviews}
              />
            </div>
          </div>
        </div>
      </div>


      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        type="danger"
      />
    </div>

  );
};

export default ProductDetail;

