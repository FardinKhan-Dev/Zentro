import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform } from 'framer-motion';

/**
 * ProductBottleScroll Component
 * 
 * Main scroll-driven canvas animation engine that displays image sequences
 * Creates a smooth video-like transition effect as user scrolls
 */
const ProductBottleScroll = ({ product, containerRef }) => {
    const localContainerRef = useRef(null);
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Use the passed containerRef or local ref
    const targetRef = containerRef || localContainerRef;

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 191]);

    // Total number of frames (based on ezgif-frame-001.jpg to ezgif-frame-192.jpg)
    const frameCount = 192;

    // Preload all images
    useEffect(() => {
        const loadedImages = [];
        let loadedCount = 0;

        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
                setImages(loadedImages);
                setImagesLoaded(true);
            }
        };

        // Load all frames
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const frameNumber = String(i).padStart(3, '0');
            img.src = `/assets/ezgif-frame-${frameNumber}.jpg`;

            img.onload = checkAllLoaded;
            img.onerror = () => {
                console.error(`Failed to load frame ${frameNumber}`);
                checkAllLoaded(); // Continue even if one fails
            };

            loadedImages[i - 1] = img;
        }
    }, []);

    // Handle canvas resize
    useEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef.current) {
                const { clientWidth, clientHeight } = canvasRef.current.parentElement;
                setCanvasSize({ width: clientWidth, height: clientHeight });
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    // Render frame on scroll
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const unsubscribe = frameIndex.on('change', (latest) => {
            const index = Math.min(
                Math.floor(latest),
                frameCount - 1
            );

            const img = images[index];
            if (!img) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate scaling to fit image with "cover" behavior (fills entire canvas)
            const imgRatio = img.width / img.height;
            const canvasRatio = canvas.width / canvas.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
                // Image is wider - scale by height
                drawHeight = canvas.height;
                drawWidth = canvas.height * imgRatio;
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Image is taller - scale by width
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgRatio;
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
            }

            // Draw image
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        });

        return () => unsubscribe();
    }, [imagesLoaded, images, frameIndex]);

    return (
        <div
            ref={targetRef}
            className="relative h-[500vh]"
            aria-label="Scrolling product showcase"
        >
            {/* Sticky container for canvas */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-transparent">
                {!imagesLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
                        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading experience...</p>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className={`w-full h-full transition-opacity duration-500 ${imagesLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ objectFit: 'cover' }}
                />
            </div>
        </div>
    );
};

export default ProductBottleScroll;
