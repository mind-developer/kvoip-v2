/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { InterModule } from 'src/engine/core-modules/inter/inter.module';
import { InterPaymentProviderService } from 'src/engine/core-modules/payment-provider/providers/inter/services/inter-payment-provider.service';
import { PAYMENT_PROVIDER_TOKENS } from 'src/engine/core-modules/payment/constants/payment-provider-tokens';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';

@Module({
  imports: [InterModule],
  providers: [
    InterPaymentProviderService,
    {
      provide: PAYMENT_PROVIDER_TOKENS[PaymentProvider.INTER],
      useClass: InterPaymentProviderService,
    },
  ],
  exports: [
    InterPaymentProviderService,
    PAYMENT_PROVIDER_TOKENS[PaymentProvider.INTER],
  ],
})
export class InterProviderModule {}
