import React from 'react';

const GalleryGrid = () => {
    // Split images into two rows for alternating scroll
    const topRowImages = [
        { url: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=600&q=80', title: 'Modern Living' },
        { url: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=600&h=400&fit=crop', title: 'Cozy Spaces' },
        { url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&h=400&fit=crop', title: 'Green Corners' },
        { url: 'https://i.pinimg.com/736x/89/2c/aa/892caa5a0e7757399ecec26aef20c8b2.jpg?w=600&h=400&fit=crop', title: 'Bright Rooms' },
    ];

    const bottomRowImages = [
        { url: 'https://simpolo-web.s3.ap-south-1.amazonaws.com/uploads/media/blog/Minimalist-Green-Escape-Terrace-Garden-Design.jpg?w=600&h=400&fit=crop', title: 'Terrace Garden' },
        { url: 'https://img.pikbest.com/wp/202405/lush-3d-visualization-of-a-indoor-garden-and-living-space_9834323.jpg!w700wp?w=600&h=400&fit=crop', title: 'Indoor Garden' },
        { url: 'https://f7e5m2b4.delivery.rocketcdn.me/wp-content/uploads/2015/01/Contemporary-garden-design-Ideas-and-Tips-www.homeworlddesign.-com-0.jpg?w=600&h=400&fit=crop', title: 'Contemporary Design' },
        { url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80', title: 'Outdoor Space' },
    ];

    return (
        <section className="py-16 overflow-hidden">
            <div>
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-2 bg-white/70 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium shadow-sm">
                            📸 Our Gallery
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-200">
                        Get Inspired
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        See how our customers style their spaces
                    </p>
                </div>

                {/* Top Row - Scroll Left */}
                <div className="relative mb-6 overflow-hidden">
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-18 bg-linear-to-r from-[#bfc0bf] dark:from-[#0a1a0f] to-white/0 z-10"></div>
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-18 bg-linear-to-l from-[#bfc0bf] dark:from-[#0a1a0f] to-white/0 z-10"></div>
                    <div className="flex gap-4 animate-scroll-left">
                        {/* Duplicate images for seamless loop */}
                        {[...topRowImages, ...topRowImages].map((image, index) => (
                            <div
                                key={index}
                                className="group relative shrink-0 w-80 h-64 overflow-hidden rounded-2xl bg-gray-200 cursor-pointer"
                            >
                                <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-semibold">{image.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Row - Scroll Right */}
                <div className="relative overflow-hidden">
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-18 bg-linear-to-r from-[#bfc0bf] dark:from-[#0a1a0f] to-white/0 z-10"></div>
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-18 bg-linear-to-l from-[#bfc0bf] dark:from-[#0a1a0f] to-white/0 z-10"></div>
                    <div className="flex gap-4 animate-scroll-right">
                        {/* Duplicate images for seamless loop */}
                        {[...bottomRowImages, ...bottomRowImages].map((image, index) => (
                            <div
                                key={index}
                                className="group relative shrink-0 w-80 h-64 overflow-hidden rounded-2xl bg-gray-200 cursor-pointer"
                            >
                                <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-semibold">{image.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button className="text-[#2E7D32] dark:text-[#9cdb8f] font-medium hover:text-[#7FC77D] dark:hover:text-[#7FC77D] transition-colors">
                        View More Gallery →
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GalleryGrid;
