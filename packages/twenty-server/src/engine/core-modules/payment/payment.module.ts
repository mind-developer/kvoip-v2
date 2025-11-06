/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { PaymentProviderModule } from 'src/engine/core-modules/payment-provider/payment-provider.module';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [PaymentProviderModule, TwentyORMModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
