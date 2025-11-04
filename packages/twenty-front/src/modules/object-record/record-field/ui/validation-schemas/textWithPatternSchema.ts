/* @kvoip-woulz proprietary */
import { z } from 'zod';

export const createTextValidationSchema = (
  pattern?: string,
  errorMessage?: string,
  isRequired = false,
) => {
  if (!pattern) {
    return isRequired
      ? z.string().min(1, 'This field is required')
      : z.string();
  }

  try {
    const regex = new RegExp(pattern);
    if (isRequired) {
      return z
        .string()
        .min(1, 'This field is required')
        .refine(
          (value) => {
            return regex.test(value);
          },
          {
            message: errorMessage || 'Invalid format',
          },
        );
    }

    return z.string().refine(
      (value) => {
        if (!value || value.trim() === '') return true;
        return regex.test(value);
      },
      {
        message: errorMessage || 'Invalid format',
      },
    );
  } catch (error) {
    console.error('Invalid regex pattern:', error);
    return isRequired
      ? z.string().min(1, 'This field is required')
      : z.string();
  }
};
