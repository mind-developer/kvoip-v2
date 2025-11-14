/* @kvoip-woulz proprietary */
import {
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

const decimalStringRegex = /^\d+(\.\d{1,2})?$/;

export function IsInterDecimalString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }
          return decimalStringRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid decimal number string (e.g., "100.50")`;
        },
      },
    });
  };
}
