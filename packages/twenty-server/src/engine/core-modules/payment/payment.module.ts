/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { PaymentProviderModule } from 'src/engine/core-modules/payment-provider/payment-provider.module';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';
/* @kvoip-woulz proprietary:begin */
import { InterModule } from 'src/engine/core-modules/inter/inter.module';
/* @kvoip-woulz proprietary:end */

@Module({
  imports: [PaymentProviderModule, InterModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
