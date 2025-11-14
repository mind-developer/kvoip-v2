/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { PaymentProviderModule } from 'src/engine/core-modules/payment-provider/payment-provider.module';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { InterModule } from 'src/engine/core-modules/inter/inter.module';

@Module({
  imports: [PaymentProviderModule, InterModule, FileUploadModule, FileModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
