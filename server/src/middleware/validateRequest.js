import { ZodError } from 'zod';
import { AppError } from '../utils/errorHandler.js';

export const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorList = error.issues || error.errors || [];
            const errorMessage = errorList
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join(', ') || 'Validation failed';

            return next(new AppError(errorMessage, 400));
        }
        next(error);
    }
};
