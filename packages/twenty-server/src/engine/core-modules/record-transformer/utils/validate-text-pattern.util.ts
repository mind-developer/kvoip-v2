/* @kvoip-woulz proprietary */
import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import { isDefined } from 'twenty-shared/utils';

export const validateTextPattern = (
  value: string | null | undefined,
  pattern?: string,
  errorMessage?: string,
): string | null => {
  if (!isDefined(value) || value.trim() === '') {
    return null;
  }

  if (!pattern) {
    return value.trim();
  }

  try {
    const regex = new RegExp(pattern);

    if (!regex.test(value)) {
      throw new RecordTransformerException(
        `Text validation failed for value: ${value}`,
        RecordTransformerExceptionCode.INVALID_TEXT_FORMAT,
        {
          userFriendlyMessage:
            errorMessage || 'Invalid format. Please check the input format.',
        },
      );
    }
  } catch (error) {
    if (error instanceof RecordTransformerException) {
      throw error;
    }

    console.warn(`Invalid regex pattern provided: ${pattern}`, error);
    return value.trim();
  }

  return value.trim();
};
