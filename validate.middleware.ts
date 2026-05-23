import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        return next(new ApiError(`Validation failed: ${issues}`, 400));
      }
      return next(error);
    }
  };
};
