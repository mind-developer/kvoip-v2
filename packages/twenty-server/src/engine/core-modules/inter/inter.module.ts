/* @kvoip-woulz proprietary */
import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { FinancialClosingModule } from 'src/engine/core-modules/financial-closing/financial-closing.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { InterApiExceptionFilter } from 'src/engine/core-modules/inter/exceptions/inter-api-exception.filter';
import { InterIntegrationWebhookController } from 'src/engine/core-modules/inter/integration/inter-integration-webhook.controller';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationResolver } from 'src/engine/core-modules/inter/integration/inter-integration.resolver';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterResolver } from 'src/engine/core-modules/inter/inter.resolver';
import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { InterWebhookService } from 'src/engine/core-modules/inter/services/inter-webhook.service';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { PaymentModule } from 'src/engine/core-modules/payment/payment.module';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';

// Move this module to the payment module
@Module({
  imports: [
    CacheStorageModule,
    EmailModule,
    FileModule,
    FileUploadModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => FinancialClosingModule),
    HttpModule,
    MessageQueueModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([InterIntegration, Workspace]),
      ],
    }),
    TypeOrmModule.forFeature([
      InterIntegration,
      Workspace,
      BillingCustomer,
      BillingCharge,
    ]),
  ],
  controllers: [InterIntegrationWebhookController],
  providers: [
    InterApiService,
    InterIntegrationResolver,
    InterIntegrationService,
    InterService,
    InterResolver,
    InterInstanceService,
    InterWebhookService,
    InterApiClientService,
    {
      provide: APP_FILTER,
      useClass: InterApiExceptionFilter,
    },
  ],
  exports: [
    InterIntegrationResolver,
    InterIntegrationService,
    InterService,
    InterResolver,
    InterInstanceService,
    InterWebhookService,
    InterApiClientService,
    InterApiService,
  ],
})
export class InterModule {}
