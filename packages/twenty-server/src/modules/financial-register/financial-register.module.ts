/* @kvoip-woulz proprietary */
import { Module } from '@nestjs/common';

import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ChargeModule } from 'src/modules/charges/charge.module';
import { FinancialRegisterValidationService } from './services/financial-register-validation.service';
import { FinancialRegisterService } from './services/financial-register.service';

@Module({
  imports: [TwentyORMModule, FileUploadModule, ChargeModule],
  providers: [FinancialRegisterService, FinancialRegisterValidationService],
  exports: [FinancialRegisterService, FinancialRegisterValidationService],
})
export class FinancialRegisterModule {}
