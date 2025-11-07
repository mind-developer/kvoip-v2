/* @kvoip-woulz proprietary */
import {
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { PaymentMethod } from 'src/engine/core-modules/payment/enums/payment-method.enum';
import { PaymentProvider } from 'src/engine/core-modules/payment/enums/payment-provider.enum';
import { PaymentMethodNotSupportedException } from 'src/engine/core-modules/payment/exceptions/payment-method-not-supported.exception';
import { PaymentProviderCapabilities } from 'src/engine/core-modules/payment/interfaces/payment-provider-capabilities.interface';
import {
  BankSlipResponse,
  /* @kvoip-woulz proprietary:begin */
  CancelChargeParams,
  CancelChargeResponse,
  CreateBolepixChargeParams,
  CreateBoletoChargeParams,
  CreateCardChargeParams,
  CreateChargeResponse,
  CreatePixChargeParams,
  GetBankSlipFileParams,
  GetChargeStatusParams,
  IPaymentProvider,
  ListChargesParams,
  ListChargesResponse,
  PaymentStatusResponse,
  RefundChargeParams,
  RefundResponse,
  UpdateChargeParams,
} from 'src/engine/core-modules/payment/interfaces/payment-provider.interface';
/* @kvoip-woulz proprietary:end */

/**
 * Inter Bank payment provider implementation
 * Implements the IPaymentProvider interface using Inter's banking API
 */
@Injectable()
export class InterPaymentProviderService implements IPaymentProvider {
  private readonly logger = new Logger(InterPaymentProviderService.name);

  /**
   * Inter Bank capabilities
   * Inter supports Bolepix (Boleto + PIX combo) but not standalone Boleto or PIX
   * No credit/debit card support in the current API
   */
  readonly capabilities: PaymentProviderCapabilities = {
    // Payment methods
    boleto: false, // Inter uses Bolepix (combined)
    bolepix: true, // Inter's main payment method (Boleto + PIX combo)
    pix: false, // Included in Bolepix
    creditCard: false, // Not supported by Inter API
    debitCard: false, // Not supported by Inter API
    bankTransfer: false,

    // Operations
    refunds: false, // TODO: Check if Inter API supports refunds
    partialRefunds: false,
    cancellation: false, // TODO: Check if Inter API supports cancellation
    updates: false, // TODO: Check if Inter API supports updates
    statusQuery: false, // Inter uses webhooks for status updates
    listCharges: false, // Inter doesn't provide a list charges endpoint

    // Features
    installments: false,
    recurring: false,
    webhooks: true, // Inter sends webhook events for status updates
  };

  constructor(
    private readonly interApiClient: InterApiClientService,
    @InjectRepository(InterIntegration)
    private readonly interIntegrationRepository: Repository<InterIntegration>,
  ) {}

  /**
   * Creates a boleto (bank slip) charge using Inter's API
   */
  async createBoletoCharge(
    params: CreateBoletoChargeParams,
  ): Promise<CreateChargeResponse> {
    this.logger.log(
      `Creating boleto charge for workspace ${params.workspaceId}, amount: ${params.amount}`,
    );

    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  async createBolepixCharge({
    workspaceId,
    integrationId,
  }: CreateBolepixChargeParams): Promise<CreateChargeResponse> {
    await this.resolveIntegrationOrThrow(workspaceId, integrationId);

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Creates a PIX charge using Inter's API
   * Note: Does all boleto generated have a pix option?
   */
  async createPixCharge(
    params: CreatePixChargeParams,
  ): Promise<CreateChargeResponse> {
    this.logger.log(
      `Creating PIX charge for workspace ${params.workspaceId}, amount: ${params.amount}`,
    );

    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Creates a credit/debit card charge
   * Note: This method is not supported by Inter API.
   */
  /* @kvoip-woulz proprietary:begin */
  async createCardCharge(
    _params: CreateCardChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new PaymentMethodNotSupportedException(
      PaymentProvider.INTER,
      PaymentMethod.CREDIT_CARD,
    );
  }
  /* @kvoip-woulz proprietary:end */

  /**
   * Retrieves bank slip file (PDF)
   */
  async getBankSlipFile(
    params: GetBankSlipFileParams,
  ): Promise<BankSlipResponse> {
    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Gets the payment status of a charge
   * Note: Inter's webhook would typically handle status updates
   * This method would need to query Inter's API for charge status
   */
  async getChargeStatus(
    params: GetChargeStatusParams,
  ): Promise<PaymentStatusResponse> {
    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Cancels a pending charge
   */
  async cancelCharge(
    params: CancelChargeParams,
  ): Promise<CancelChargeResponse> {
    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Refunds a paid charge
   */
  async refundCharge(_params: RefundChargeParams): Promise<RefundResponse> {
    await this.resolveIntegrationOrThrow(
      _params.workspaceId,
      _params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Updates charge information
   */
  async updateCharge(
    params: UpdateChargeParams,
  ): Promise<CreateChargeResponse> {
    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  /**
   * Lists all charges for a workspace
   */
  async listCharges(params: ListChargesParams): Promise<ListChargesResponse> {
    await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    throw new NotImplementedException('Not implemented');
  }

  private async resolveIntegrationOrThrow(
    workspaceId: string,
    integrationId?: string,
  ): Promise<InterIntegration> {
    const integration = integrationId
      ? await this.interIntegrationRepository.findOne({
          where: {
            id: integrationId,
            workspace: { id: workspaceId },
          },
          relations: {
            workspace: true,
          },
        })
      : await this.interIntegrationRepository.findOne({
          where: {
            workspace: { id: workspaceId },
          },
          relations: {
            workspace: true,
          },
        });

    if (!integration) {
      throw new NotFoundException(
        `No Inter integration found for workspace ${workspaceId}`,
      );
    }

    return integration;
  }
}
