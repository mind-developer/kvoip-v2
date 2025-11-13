/* @kvoip-woulz proprietary */
import {
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;

export function IsInterDateString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }
          if (!dateStringRegex.test(value)) {
            return false;
          }
          // Validate that it's a valid date
          const date = new Date(value);
          return (
            date instanceof Date &&
            !isNaN(date.getTime()) &&
            value === date.toISOString().split('T')[0]
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date string in YYYY-MM-DD format (e.g., "2025-12-14")`;
        },
      },
    });
  };
}
