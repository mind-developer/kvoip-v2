/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { AsasProviderModule } from 'src/engine/core-modules/payment-provider/providers/asas/asas-provider.module';
import { InterProviderModule } from 'src/engine/core-modules/payment-provider/providers/inter/inter-provider.module';

@Module({
  imports: [InterProviderModule, AsasProviderModule],
  exports: [InterProviderModule, AsasProviderModule],
})
export class PaymentProviderModule {}
