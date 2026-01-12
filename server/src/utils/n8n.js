import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const logger = pino({ name: 'n8n-webhook' });

/**
 * Triggers an n8n webhook safely (fire-and-forget).
 * Does not block the main thread and catches all errors to prevent crashing.
 * 
 * @param {string} path - The specific webhook path (e.g., 'user-registered', 'order-created')
 * @param {object} data - The payload to send
 */
export const triggerN8nWebhook = async (path, data) => {
    // Support both Docker (local dev) and cloud (production) URLs
    // Local dev (Docker): http://n8n:5678/webhook-test
    // Production (n8n.cloud): https://your-instance.app.n8n.cloud/webhook
    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook-test';

    // If N8N_WEBHOOK_URL is not configured, skip webhook trigger
    if (!process.env.N8N_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
        logger.warn('N8N_WEBHOOK_URL not configured in production, skipping webhook trigger');
        return;
    }

    const url = `${n8nBaseUrl}/${path}`;

    try {
        logger.info({ msg: 'Triggering n8n webhook', path });

        // Using fetch (available in Node 18+)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            logger.warn({
                msg: 'n8n webhook received non-200 response',
                status: response.status,
                path
            });
        } else {
            logger.info({ msg: 'n8n webhook triggered successfully', path });
        }
    } catch (error) {
        // Log error but don't throw, as this is a side-effect
        logger.error({
            msg: 'Failed to trigger n8n webhook',
            error: error.message,
            path
        });
    }
};
