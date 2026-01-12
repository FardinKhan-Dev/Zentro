import pino from 'pino';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const levels = {
    http: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

// Only use pino-pretty in development
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    customLevels: levels,
    useOnlyCustomLevels: true,
    timestamp: pino.stdTimeFunctions.isoTime,
    // Only use pretty formatting in development
    ...(isDevelopment && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    }),
});

export default logger;
