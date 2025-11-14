/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { AsasPaymentProviderService } from 'src/engine/core-modules/payment-provider/providers/asas/services/asas-payment-provider.service';
import { PAYMENT_PROVIDER_TOKENS } from 'src/engine/core-modules/payment/constants/payment-provider-tokens';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';

@Module({
  providers: [
    AsasPaymentProviderService,
    {
      provide: PAYMENT_PROVIDER_TOKENS[PaymentProvider.ASAS],
      useClass: AsasPaymentProviderService,
    },
  ],
  exports: [
    AsasPaymentProviderService,
    PAYMENT_PROVIDER_TOKENS[PaymentProvider.ASAS],
  ],
})
export class AsasProviderModule {}
