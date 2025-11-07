/* @kvoip-woulz proprietary */
import {
  NotImplementedException as BadRequestExeption,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import {
  InterCustomer,
  InterCustomerType,
  InterCustomerUf,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';
/* @kvoip-woulz proprietary:end */
import { InterApiClientService } from 'src/engine/core-modules/inter/services/inter-api-client.service';
import { ChargeStatus } from 'src/engine/core-modules/payment/enums/charge-status.enum';
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
    throw new BadRequestExeption('Not implemented');
  }

  async createBolepixCharge({
    workspaceId,
    integrationId,
    amount,
    payerInfo,
    expirationMinutes,
    description,
    metadata,
  }: CreateBolepixChargeParams): Promise<CreateChargeResponse> {
    const integration = await this.resolveIntegrationOrThrow(
      workspaceId,
      integrationId,
    );

    const chargeCode = randomUUID().replace(/-/g, '').slice(0, 15);

    const { dueDate, formatted } = this.resolveDueDate(expirationMinutes);

    const response = await this.interApiClient.createCharge(
      {
        seuNumero: chargeCode,
        valorNominal: this.formatAmount(amount),
        dataVencimento: formatted,
        numDiasAgenda: '0',
        pagador: this.mapToInterCustomer(payerInfo),
        menssagem: description ? [description] : undefined,
      },
      integration,
    );

    if (!response.codigoSolicitacao) {
      throw new BadRequestExeption(
        'Inter API response did not include a charge identifier',
      );
    }

    return {
      chargeId: chargeCode,
      externalChargeId: response.codigoSolicitacao,
      status: ChargeStatus.PENDING,
      paymentMethod: PaymentMethod.BOLEPIX,
      amount,
      dueDate,
      metadata: {
        ...metadata,
        interChargeCode: response.codigoSolicitacao,
        integrationId: integration.id,
        expirationMinutes,
      },
    };
  }

  /**
   * Creates a PIX charge using Inter's API
   * Note: Does all boleto generated have a pix option?
   */
  async createPixCharge(
    _params: CreatePixChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  /**
   * Creates a credit/debit card charge
   * Note: This method is not supported by Inter API.
   */
  async createCardCharge(
    _params: CreateCardChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new PaymentMethodNotSupportedException(
      PaymentProvider.INTER,
      PaymentMethod.CREDIT_CARD,
    );
  }

  /**
   * Retrieves bank slip file (PDF)
   */
  async getBankSlipFile(
    params: GetBankSlipFileParams,
  ): Promise<BankSlipResponse> {
    const integration = await this.resolveIntegrationOrThrow(
      params.workspaceId,
      params.integrationId,
    );

    const pdfBase64 = await this.interApiClient.getChargePdf(
      params.chargeId,
      integration,
    );

    return {
      fileBuffer: Buffer.from(pdfBase64, 'base64'),
      fileName: `inter-bolepix-${params.chargeId}.pdf`,
    };
  }

  /**
   * Gets the payment status of a charge
   * Note: Inter's webhook would typically handle status updates
   * This method would need to query Inter's API for charge status
   */
  async getChargeStatus(
    _params: GetChargeStatusParams,
  ): Promise<PaymentStatusResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  /**
   * Cancels a pending charge
   */
  async cancelCharge(
    _params: CancelChargeParams,
  ): Promise<CancelChargeResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  /**
   * Refunds a paid charge
   */
  async refundCharge(_params: RefundChargeParams): Promise<RefundResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  /**
   * Updates charge information
   */
  async updateCharge(
    _params: UpdateChargeParams,
  ): Promise<CreateChargeResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  /**
   * Lists all charges for a workspace
   */
  async listCharges(_params: ListChargesParams): Promise<ListChargesResponse> {
    throw new BadRequestExeption('Not implemented');
  }

  // TODO: Confirm inter expiration date options
  private resolveDueDate(expirationMinutes?: number): {
    dueDate: Date;
    formatted: string;
  } {
    const minutes = Math.max(expirationMinutes ?? 60 * 24, 1);
    const dueDate = new Date(Date.now() + minutes * 60 * 1000);

    return {
      dueDate,
      formatted: this.formatDate(dueDate),
    };
  }

  private formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  private mapToInterCustomer(
    payerInfo: CreateBolepixChargeParams['payerInfo'],
  ): InterCustomer {
    const sanitizedTaxId = this.sanitizeDigits(payerInfo.taxId);
    const address = payerInfo.address;

    return {
      cpfCnpj: sanitizedTaxId,
      tipoPessoa: this.determineLegalEntityType(payerInfo.taxId),
      nome: payerInfo.name,
      endereco: address ? this.buildAddressLine(address) : '',
      cidade: address?.city ?? '',
      uf: this.resolveUf(address?.state),
      cep: address ? this.sanitizeDigits(address.zipCode) : '',
      bairro: address?.neighborhood,
      email: payerInfo.email,
      ddd: this.extractDDD(payerInfo.phone),
      telefone: this.extractPhoneNumber(payerInfo.phone),
      numero: address?.number,
      complemento: address?.complement,
    };
  }

  private buildAddressLine(
    address: NonNullable<CreateBolepixChargeParams['payerInfo']['address']>,
  ): string {
    const parts = [
      address.street,
      address.number ? `nº ${address.number}` : undefined,
      address.complement,
    ].filter(Boolean);

    return parts.join(', ');
  }

  private determineLegalEntityType(taxId: string): InterCustomerType {
    return this.sanitizeDigits(taxId).length > 11
      ? InterCustomerType.JURIDICA
      : InterCustomerType.FISICA;
  }

  private sanitizeDigits(value?: string): string {
    return value?.replace(/\D/g, '') ?? '';
  }

  private extractDDD(phone?: string): string | undefined {
    const digits = this.sanitizeDigits(phone);

    return digits.length >= 10 ? digits.slice(0, 2) : undefined;
  }

  private extractPhoneNumber(phone?: string): string | undefined {
    const digits = this.sanitizeDigits(phone);

    return digits.length > 2 ? digits.slice(2) : undefined;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private resolveUf(state?: string): InterCustomerUf {
    if (!state) {
      throw new BadRequestExeption('State is required for Inter charges');
    }

    const upperState = state.toUpperCase();
    if ((Object.values(InterCustomerUf) as string[]).includes(upperState)) {
      return upperState as InterCustomerUf;
    }

    throw new BadRequestExeption(
      `Invalid state provided for Inter customer: ${state}`,
    );
  }

  private async resolveIntegrationOrThrow(
    workspaceId: string,
    integrationId?: string,
  ): Promise<InterIntegration> {
    const integration = await this.interIntegrationRepository.findOne({
      where: integrationId
        ? {
            id: integrationId,
            workspace: { id: workspaceId },
          }
        : {
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
