import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';

export function validateRequest<T>(type: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input = plainToClass(type, req.body) as unknown;
    const validationOptions: ValidatorOptions = {
      whitelist: true,
    };
    const errors = await validate(
      input as Record<string, unknown>,
      validationOptions
    );
    if (errors.length > 0) {
      const extractConstraints = (error: ValidationError): string => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }
        if (error.children) {
          return error.children.map(extractConstraints).join(', ');
        }
        return '';
      };
      const message = errors.map(extractConstraints).join(', ');
      res.status(400).json({ error: message });
    } else {
      next();
    }
  };
}
