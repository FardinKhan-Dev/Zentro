/**
 * Courier Service
 * Handles interactions with external courier APIs.
 * Currently mocked for demonstration.
 */

/**
 * Fetch status from Courier API (Simulated)
 * @param {string} trackingNumber 
 * @returns {Promise<Object>} { status, payment_collected, location }
 */
export const fetchCourierStatus = async (trackingNumber) => {
    // In production, use axios/fetch to call real API
    // e.g., await axios.get(`https://api.courier.com/track/${trackingNumber}`);

    // --- MOCK LOGIC ---
    const trackingUpper = trackingNumber.toUpperCase();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (trackingUpper.includes('DEL')) {
        return {
            status: 'delivered',
            payment_collected: true, // Cash collected
            location: 'Customer Address',
            timestamp: new Date()
        };
    }

    if (trackingUpper.includes('RET')) {
        return {
            status: 'returned',
            payment_collected: false,
            location: 'Warehouse',
            timestamp: new Date()
        };
    }

    // Default: Moving
    return {
        status: 'shipped', // or 'in_transit'
        payment_collected: false,
        location: 'In Transit Hub',
        timestamp: new Date()
    };
};

export default {
    fetchCourierStatus
};
