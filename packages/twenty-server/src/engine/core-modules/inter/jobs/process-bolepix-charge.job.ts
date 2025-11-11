/* @kvoip-woulz proprietary */
import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { APP_LOCALES } from 'twenty-shared/translations';

// TODO: Move this job to the payment module
export type ProcessBolepixChargeJobData = {
  interChargeCode: string;
  workspaceId: string;
  chargeCode: string;
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
    private readonly interApiClient: InterApiClientService,
  ) {}

  @Process(ProcessBolepixChargeJob.name)
  async handle(data: ProcessBolepixChargeJobData): Promise<void> {
    const { interChargeCode, workspaceId, chargeCode, userEmail, locale } =
      data;

    try {
      this.logger.log(
        `Processing bolepix file for workspace: ${workspaceId}, charge: ${interChargeCode}`,
      );

      const bolepixFilePath = await this.interService.getChargePdf({
        interChargeId: interChargeCode,
        workspaceId,
      });

      await this.billingChargeRepository.update(
        { chargeCode },
        {
          interBillingChargeFilePath: bolepixFilePath,
        },
      );

      const customer = await this.billingCustomerRepository.findOne({
        where: { interBillingChargeId: chargeCode },
      });

      if (customer) {
        await this.billingCustomerRepository.update(customer.id, {
          currentInterBankSlipChargeFilePath: bolepixFilePath,
        });
      }

      const bankSlipFileLink = this.interService.getFileLinkFromPath(
        bolepixFilePath,
        workspaceId,
      );
      // Send the email with the bolepix file
      await this.interService.sendBankSkipFileEmail({
        fileLink: bankSlipFileLink,
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
