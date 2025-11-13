/* @kvoip-woulz proprietary */
import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { KVOIP_ADMIN_WORKSPACE } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';
import { APP_LOCALES } from 'twenty-shared/translations';

// TODO: Move this job to the payment module
export type ProcessBolepixChargeJobData = {
  interChargeCode: string;
  workspaceId: string;
  chargeId: string;
  userEmail: string;
  locale: keyof typeof APP_LOCALES;
};

@Processor({
  queueName: MessageQueue.billingQueue,
  scope: Scope.REQUEST,
})
export class ProcessBolepixChargeJob {
  protected readonly logger = new Logger(ProcessBolepixChargeJob.name);

  constructor(
    @InjectRepository(BillingCharge)
    private readonly billingChargeRepository: Repository<BillingCharge>,
    @InjectRepository(BillingCustomer)
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    private readonly interService: InterService,
    private readonly paymentService: PaymentService,
  ) {}

  @Process(ProcessBolepixChargeJob.name)
  async handle({
    interChargeCode,
    workspaceId,
    chargeId,
    userEmail,
    locale,
  }: ProcessBolepixChargeJobData): Promise<void> {
    try {
      this.logger.log(
        `Processing bolepix file for workspace: ${workspaceId}, charge: ${interChargeCode}`,
      );

      const { signedFileUrl } = await this.paymentService.getBankSlipFile({
        workspaceId: KVOIP_ADMIN_WORKSPACE.id,
        chargeId,
        provider: PaymentProvider.INTER,
      });

      // Send the email with the bolepix file
      await this.interService.sendBankSkipFileEmail({
        fileLink: signedFileUrl,
        userEmail,
        locale,
        interChargeCode,
      });

      this.logger.log(
        `Successfully processed bolepix file and sent email for workspace: ${workspaceId}, charge: ${interChargeCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process bolepix file for workspace: ${workspaceId}, charge: ${interChargeCode}`,
        error,
      );
      throw error;
    }
  }
}
