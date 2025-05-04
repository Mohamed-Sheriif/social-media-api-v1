import { plainToClass } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
// eslint-disable-next-line prettier/prettier
export async function validateRequestMethod<T>(type: new () => T, data: any) {
  const file = plainToClass(type, data) as unknown;
  const validationOptions: ValidatorOptions = {
    whitelist: true,
  };
  const errors = await validate(
    file as Record<string, unknown>,
    validationOptions
  );
  if (errors.length > 0) {
    const message = errors
      .map((error: ValidationError) => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }
        return '';
      })
      .join(', ');
    return message;
  } else {
    return;
  }
}
