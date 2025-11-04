import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export const ValidateFreeTrialDuration = (
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'validateFreeTrialDuration',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any, args: ValidationArguments) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = args.object as any;

          // Only validate if free trial is enabled
          if (obj.BILLING_IS_FREE_TRIAL_ENABLED !== true) {
            return true;
          }

          // If free trial is enabled, the duration must be greater than 0
          return typeof value === 'number' && value > 0;
        },
      },
    });
  };
};
