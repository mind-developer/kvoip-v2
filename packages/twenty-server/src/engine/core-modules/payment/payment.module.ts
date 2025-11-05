import { Module } from '@nestjs/common';
import { PaymentProviderModule } from 'src/engine/core-modules/payment-provider/payment-provider.module';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';

@Module({
  imports: [PaymentProviderModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
