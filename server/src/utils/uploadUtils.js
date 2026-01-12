import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (buffer, folder = 'zentro/uploads') => {
    return new Promise((resolve, reject) => {
        // Check if Cloudinary is properly configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.warn('⚠ Cloudinary not configured - skipping image upload');
            return reject(new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'));
        }

        // Add timeout for upload
        const timeout = setTimeout(() => {
            reject(new Error('Cloudinary upload timed out after 30 seconds. Check network connectivity.'));
        }, 30000);

        try {
            const stream = cloudinary.uploader.upload_stream({ folder, timeout: 25000 }, (error, result) => {
                clearTimeout(timeout);
                if (error) {
                    // Log full error details for debugging
                    console.error('Cloudinary upload error (full):', JSON.stringify(error, null, 2));
                    const errorMsg = error.message || error.error?.message || error.http_code || JSON.stringify(error);
                    return reject(new Error(`Cloudinary upload failed: ${errorMsg}`));
                }
                resolve({ url: result.secure_url, public_id: result.public_id });
            });
            stream.end(buffer);
        } catch (err) {
            clearTimeout(timeout);
            console.error('Cloudinary stream error:', err);
            reject(new Error(`Cloudinary stream error: ${err.message}`));
        }
    });
};
