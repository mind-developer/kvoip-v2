import { Module } from '@nestjs/common';
import { MOCKASASService } from 'src/engine/core-modules/payment-provider/providers/asas/services/mock-asas.service';

@Module({
  providers: [MOCKASASService],
  exports: [MOCKASASService],
})
export class MOCKASASModule {}
