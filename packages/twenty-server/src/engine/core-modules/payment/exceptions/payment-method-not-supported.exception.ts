/* @kvoip-woulz proprietary */
import { BadRequestException } from '@nestjs/common';

import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';

export class PaymentMethodNotSupportedException extends BadRequestException {
  constructor(provider: PaymentProvider, method: PaymentMethod) {
    super(
      `Payment method ${method} is not supported by provider ${provider}. ` +
        `Please use a different payment method or provider.`,
    );
  }
}
