import { Module } from '@nestjs/common';
import { MOCKASASModule } from 'src/engine/core-modules/payment-provider/providers/asas/mock-asas.module';
import { MOCKInterModule } from 'src/engine/core-modules/payment-provider/providers/inter/mock-inter.module';

@Module({
  imports: [MOCKInterModule, MOCKASASModule],
})
export class PaymentProviderModule {}
