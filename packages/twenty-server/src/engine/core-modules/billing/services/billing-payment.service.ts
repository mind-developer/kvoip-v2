/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';

import { APP_LOCALES } from 'twenty-shared/translations';

import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';

import { ProcessBolepixChargeJobData } from 'src/engine/core-modules/inter/jobs/process-bolepix-charge.job';
import { KVOIP_ADMIN_WORKSPACE } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CreateChargeDto } from 'src/engine/core-modules/payment/dtos/create-charge.dto';
import { PaymentMethod } from 'src/engine/core-modules/payment/enums/payment-method.enum';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';
import { Customer } from 'src/engine/core-modules/payment/interfaces/payment-provider.interface';
import { PaymentService } from 'src/engine/core-modules/payment/services/payment.service';

@Injectable()
export class BillingPaymentService {
  private readonly logger = new Logger(BillingPaymentService.name);

  constructor(
    private readonly paymentService: PaymentService,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly billingQueue: MessageQueueService,
  ) {}

  /**
   * Creates a BOLEPIX charge using the payment module and dispatches a job
   * to handle bolepix creation and email sending
   *
   * This method automatically uses the Inter integration from the admin workspace
   * and always creates a BOLEPIX charge.
   *
   * Note: Right now the billing module is the only place where its necessary
   * to move the bankslip file to the queue system. We need to check if this is
   * needed in other places if so, move this to a new method in the payment service.
   */
  async createChargeAndDispatchBolepixJob({
    amount,
    payerInfo,
    userEmail,
    locale,
    description,
    dueDate,
    expirationMinutes,
    metadata,
  }: {
    amount: number;
    payerInfo: Customer;
    userEmail: string;
    locale?: keyof typeof APP_LOCALES;
    description?: string;
    dueDate?: Date;
    expirationMinutes?: number;
    metadata?: Record<string, any>;
  }): Promise<ChargeWorkspaceEntity> {
    const chargeDto: CreateChargeDto = {
      paymentMethod: PaymentMethod.BOLEPIX,
      amount,
      payerInfo,
      description,
      dueDate,
      expirationMinutes,
      metadata,
    };

    const charge = await this.paymentService.createCharge({
      workspaceId: KVOIP_ADMIN_WORKSPACE.id,
      chargeDto,
      provider: PaymentProvider.INTER,
    });

    if (!charge.requestCode) {
      throw new Error(
        `Charge ${charge.id} does not have requestCode set. ` +
          `The payment service should store externalChargeId in requestCode field.`,
      );
    }

    const interChargeCode = charge.requestCode;

    const jobData: ProcessBolepixChargeJobData = {
      interChargeCode,
      workspaceId: KVOIP_ADMIN_WORKSPACE.id,
      chargeId: charge.id,
      userEmail,
      locale: locale ?? APP_LOCALES['pt-BR'],
    };

    await this.billingQueue.add<ProcessBolepixChargeJobData>(
      'ProcessBolepixChargeJob',
      jobData,
    );

    this.logger.log(
      `Successfully created charge ${charge.id} and dispatched bolepix processing job`,
    );

    return charge;
  }
}
