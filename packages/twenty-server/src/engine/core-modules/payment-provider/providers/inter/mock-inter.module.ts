import { Module } from '@nestjs/common';
import { MOCKInterService } from 'src/engine/core-modules/payment-provider/providers/inter/services/mock-inter.service';

@Module({
  providers: [MOCKInterService],
  exports: [MOCKInterService],
})
export class MOCKInterModule {}
