/* @kvoip-woulz proprietary */
import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';
import { randomUUID } from 'crypto';

import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { InterBillingChargeFileEmail } from 'twenty-emails';
import { APP_LOCALES } from 'twenty-shared/translations';
import { JsonContains, MoreThanOrEqual, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { ChargeStatus } from 'src/engine/core-modules/billing/enums/billing-charge.status.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { ProcessBolepixChargeJobData } from 'src/engine/core-modules/inter/jobs/process-bolepix-charge.job';
import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { getNextBusinessDays } from 'src/engine/core-modules/inter/utils/get-next-business-days.util';
import { getPriceFromStripeDecimal } from 'src/engine/core-modules/inter/utils/get-price-from-stripe-decimal.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
/**
 * @deprecated Use the PaymentService instead
 */
export class InterService {
  private readonly logger = new Logger(InterService.name);

  constructor(
    @InjectRepository(BillingCustomer)
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(BillingCharge)
    private readonly billingChargeRepository: Repository<BillingCharge>,
    @Optional()
    private readonly interIntegrationService: InterIntegrationService,
    private readonly interApiClient: InterApiClientService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectMessageQueue(MessageQueue.billingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async createBolepixCharge({
    customer,
    planPrice,
    workspaceId,
    locale,
    userEmail,
    planKey,
  }: {
    planKey: BillingPlanKey;
    planPrice: string;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
    userEmail: string;
    customer: BillingCustomer;
  }): Promise<string> {
    await this.validateCustomerChargeData(customer);

    const { document, legalEntity, name, address, city, stateUnity, cep } =
      customer;

    const pendingCharge = await this.billingChargeRepository.find({
      where: {
        metadata: JsonContains({
          workspaceId,
        }),
        dueDate: MoreThanOrEqual(new Date(Date.now())),
        status: ChargeStatus.UNPAID,
      },
    });

    if (pendingCharge.length > 0) {
      const currentPendinCharge = pendingCharge[0];

      const { interBillingChargeFilePath } = currentPendinCharge;

      const bankSlipFileLink = this.getFileLinkFromPath(
        interBillingChargeFilePath,
        workspaceId,
      );

      await this.sendBankSkipFileEmail({
        locale,
        userEmail,
        fileLink: bankSlipFileLink,
        interChargeCode: currentPendinCharge.metadata.interChargeCode,
      });

      return bankSlipFileLink;
    }

    const chargeCode = randomUUID().replace(/-/g, '').slice(0, 15);

    const dueDate = getNextBusinessDays(5);

    // TODO: Check if there already a pending payment for the current workspace
    //  before creating another charge since it will fail anyways if that's the case.
    const response = await this.interApiClient.createCharge({
      seuNumero: chargeCode,
      // TODO: Add a number prop in the billing price entity
      valorNominal: getPriceFromStripeDecimal(planPrice).toString(),
      dataVencimento: dueDate,
      numDiasAgenda: '5',
      pagador: {
        cpfCnpj: document,
        tipoPessoa: legalEntity,
        nome: name,
        endereco: address,
        cidade: city,
        uf: stateUnity,
        cep,
      },
    });

    const interChargeCode = response.codigoSolicitacao;

    assert(
      isDefined(interChargeCode),
      `Failed to get payment charge id from Inter, got: ${interChargeCode}`,
    );

    this.logger.log(
      `Bolepix code for workspace: ${workspaceId}: ${interChargeCode}`,
    );

    await this.billingChargeRepository.upsert(
      {
        chargeCode,
        dueDate,
        metadata: {
          planKey,
          workspaceId,
          interChargeCode,
        },
      },
      {
        conflictPaths: ['chargeCode'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingCustomerRepository.update(customer.id, {
      interBillingChargeId: chargeCode,
    });

    const jobData: ProcessBolepixChargeJobData = {
      interChargeCode,
      workspaceId,
      chargeId: chargeCode,
      userEmail,
      locale,
    };

    await this.messageQueueService.add('ProcessBolepixChargeJob', jobData);

    this.logger.log(
      `Enqueued bolepix processing job for workspace: ${workspaceId}, charge: ${interChargeCode}`,
    );

    return interChargeCode;
  }

  /**
   * Loads a workspace integration by ID
   * @param integrationId Integration ID
   * @returns InterIntegration or null if not found
   */
  async loadWorkspaceIntegration(
    integrationId: string,
  ): Promise<InterIntegration | null> {
    if (!this.interIntegrationService) {
      this.logger.warn(
        'InterIntegrationService not available, skipping integration load',
      );

      return null;
    }

    return await this.interIntegrationService.findById(integrationId);
  }

  async getChargePdf({
    interChargeId,
    workspaceId,
    integration,
  }: {
    workspaceId: string;
    interChargeId: string;
    integration?: InterIntegration;
  }): Promise<string> {
    const pdfBase64 = await this.interApiClient.getChargePdf(
      interChargeId,
      integration,
    );

    const fileFolder = FileFolder.BillingSubscriptionBill;

    // TODO: Check if there is are any existing files for this workspace and remove them before uploading a new one
    const { files } = await this.fileUploadService.uploadFile({
      file: Buffer.from(pdfBase64, 'base64'),
      filename: `bolepix-${interChargeId}-${workspaceId}.pdf`,
      mimeType: 'application/pdf',
      fileFolder,
      workspaceId,
    });

    files[0].path;

    return files[0].path;
  }

  async getAccountBalance(integration?: InterIntegration) {
    return await this.interApiClient.getAccountBalance(integration);
  }

  async getAccountInfo(integrationId: string) {
    const integration = await this.loadWorkspaceIntegration(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    return await this.interApiClient.getAccountInfo(integration);
  }

  async syncData(integrationId: string) {
    const integration = await this.loadWorkspaceIntegration(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    // Implemente a lógica de sincronização com o Banco Inter
    return true;
  }

  async validateCustomerChargeData(customer: BillingCustomer) {
    const { name, document, legalEntity, address, cep, stateUnity, city } =
      customer;

    const chargeDataArray: (string | null | undefined)[] = [
      name,
      document,
      legalEntity,
      address,
      cep,
      stateUnity,
      city,
    ];

    if (chargeDataArray.includes(null) || chargeDataArray.includes(undefined))
      throw new BillingException(
        `Customer missing inter charge data`,
        BillingExceptionCode.BILLING_MISSING_REQUEST_BODY,
      );
  }

  async sendBankSkipFileEmail({
    fileLink,
    locale,
    userEmail,
    interChargeCode,
  }: {
    fileLink: string;
    userEmail: string;
    locale: keyof typeof APP_LOCALES;
    interChargeCode: string;
  }) {
    const emailTemplate = InterBillingChargeFileEmail({
      duration: '5 Buisiness days',
      link: fileLink,
      locale,
    });

    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    i18n.activate(locale);

    const isSandbox = [
      NodeEnvironment.DEVELOPMENT,
      NodeEnvironment.TEST,
    ].includes(this.twentyConfigService.get('NODE_ENV'));

    this.logger.log(`Sengind email to ${userEmail}`);

    const emailsTo = [
      userEmail,
      isSandbox
        ? this.twentyConfigService.get('INTER_SANDBOX_EMAIL_TO')
        : undefined,
    ].filter(isDefined);

    for (const emailTo of emailsTo) {
      this.emailService.send({
        from: `${this.twentyConfigService.get(
          'EMAIL_FROM_NAME',
        )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
        to: emailTo,
        subject: t`Inter Bilepix Billing Charge ${isSandbox ? `(${interChargeCode})` : ''}`,
        text,
        html,
      });
    }
  }

  async interSandboxPayBill({
    interChargeCode,
    integration,
  }: {
    interChargeCode: string;
    integration?: InterIntegration;
  }): Promise<{ success: boolean }> {
    const isSandbox = [
      NodeEnvironment.DEVELOPMENT,
      NodeEnvironment.TEST,
    ].includes(this.twentyConfigService.get('NODE_ENV'));

    if (!isSandbox) {
      throw new Error(
        'This endpoint is only available in development/test mode',
      );
    }

    await this.interApiClient.payCharge(interChargeCode, integration);

    return {
      success: true,
    };
  }

  getFileLinkFromPath(filePath: string, workspaceId: string) {
    const baseUrl = this.twentyConfigService.get('SERVER_URL');

    const signedPath = this.fileService.signFileUrl({
      url: filePath,
      workspaceId,
    });

    return `${baseUrl}/files/${signedPath}`;
  }
}
