/* @kvoip-woulz proprietary */
import { z } from 'zod';

export const createTextValidationSchema = (
  pattern?: string,
  errorMessage?: string,
) => {
  if (!pattern) {
    return z.string();
  }

  try {
    const regex = new RegExp(pattern);
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
    return z.string();
  }
};
