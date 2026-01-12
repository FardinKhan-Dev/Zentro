import logger from '../utils/logger.js';

const TEXTBEE_API_URL = 'https://api.textbee.dev/api/v1';

/**
 * Send SMS using Textbee API
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<boolean>} - Success status
 */
export const sendSMS = async (to, message) => {
    try {
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        if (!apiKey || !deviceId) {
            logger.warn('Textbee API credentials missing. SMS not sent.');
            return false;
        }

        const response = await fetch(`${TEXTBEE_API_URL}/gateway/devices/${deviceId}/sendSMS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                recipients: [to],
                message: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error(`Textbee API Error: ${response.status} ${response.statusText}`, errorData);
            return false;
        }

        const data = await response.json();
        logger.info(`SMS sent successfully to ${to}`);
        return true;
    } catch (error) {
        logger.error('Failed to send SMS via Textbee:', error);
        return false;
    }
};

export default {
    sendSMS,
};
