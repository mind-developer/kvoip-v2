/* @kvoip-woulz proprietary */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LessThan } from 'typeorm';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import {
  AccountPayableWorkspaceEntity,
  /* @kvoip-woulz proprietary:begin */
  PayablePaymentType,
  /* @kvoip-woulz proprietary:end */
  PayableStatus,
} from '../standard-objects/account-payable.workspace-entity';
import {
  AccountReceivableWorkspaceEntity,
  ReceivableStatus,
} from '../standard-objects/account-receivable.workspace-entity';
import { FinancialRegisterValidationService } from './financial-register-validation.service';

// ============================================
// DTOs / INTERFACES
// ============================================

export interface CreateReceivableInput {
  companyId: string;
  amount: number;
  dueDate: Date;
  documentNumber?: string;
  isRecharge?: boolean;
  invoiceId?: string;
  closingExecutionId?: string;
  cpfCnpj?: string;
  generateBankSlip?: boolean;
  generatePix?: boolean;
}

export interface CreatePayableInput {
  companyId: string;
  amount: number;
  dueDate: Date;
  /* @kvoip-woulz proprietary:begin */
  paymentType?: PayablePaymentType;
  /* @kvoip-woulz proprietary:end */
  barcode?: string;
  message?: string;
  cpfCnpj?: string;
}

export interface BankSlipResponse {
  bankSlipLink: string;
  barcode: string;
  documentNumber: string;
  dueDate: Date;
}

export interface PixCodeResponse {
  pixKey: string;
  pixCode: string;
  qrCode: string;
}

export interface OverdueCheckResult {
  totalChecked: number;
  markedOverdue: number;
  excludedRecharges: number;
}

// ============================================
// SERVICE
// ============================================

@Injectable()
export class FinancialRegisterService {
  private readonly logger = new Logger(FinancialRegisterService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly validationService: FinancialRegisterValidationService,
    private readonly interApiService: InterApiService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // ============================================
  // CREATE RECEIVABLE
  // ============================================

  async createReceivable(
    workspaceId: string,
    input: CreateReceivableInput,
  ): Promise<AccountReceivableWorkspaceEntity> {
    this.logger.log(`Creating receivable for workspace ${workspaceId}`);

    this.validationService.validateAmount(input.amount);

    const accountReceivableRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
        workspaceId,
        'company',
        { shouldBypassPermissionChecks: true },
      );

    const company = await companyRepository.findOne({
      where: { id: input.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company ${input.companyId} not found`);
    }

    const receivable = accountReceivableRepository.create({
      status: ReceivableStatus.PENDING,
      amount: {
        amountMicros: input.amount * 1000000,
        currencyCode: 'BRL',
      },
      dueDate: input.dueDate.toISOString(),
      companyId: input.companyId,
      documentNumber: input.documentNumber,
      isRecharge: input.isRecharge || false,
      invoiceId: input.invoiceId,
      closingExecutionId: input.closingExecutionId,
      cpfCnpj: input.cpfCnpj || company.cpfCnpj,
    });

    const savedReceivable = await accountReceivableRepository.save(receivable);

    this.logger.log(`Receivable created: ${savedReceivable.id}`);

    if (input.generateBankSlip) {
      try {
        await this.generateBankSlip(workspaceId, savedReceivable.id);
      } catch (error) {
        this.logger.error(
          `Failed to generate bank slip for receivable ${savedReceivable.id}`,
          error,
        );
      }
    }

    if (input.generatePix) {
      try {
        await this.generatePixCode(workspaceId, savedReceivable.id);
      } catch (error) {
        this.logger.error(
          `Failed to generate PIX code for receivable ${savedReceivable.id}`,
          error,
        );
      }
    }

    if (input.isRecharge) {
      try {
        await this.processRecharge(workspaceId, savedReceivable.id);
      } catch (error) {
        this.logger.error(
          `Failed to process recharge for receivable ${savedReceivable.id}`,
          error,
        );
      }
    }

    return savedReceivable;
  }

  // ============================================
  // CREATE PAYABLE
  // ============================================

  async createPayable(
    workspaceId: string,
    input: CreatePayableInput,
  ): Promise<AccountPayableWorkspaceEntity> {
    this.logger.log(`Creating payable for workspace ${workspaceId}`);

    this.validationService.validateAmount(input.amount);

    const accountPayableRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountPayableWorkspaceEntity>(
        workspaceId,
        'accountPayable',
        { shouldBypassPermissionChecks: true },
      );

    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
        workspaceId,
        'company',
        { shouldBypassPermissionChecks: true },
      );

    const company = await companyRepository.findOne({
      where: { id: input.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company ${input.companyId} not found`);
    }

    if (input.barcode) {
      if (!this.validationService.validateBarcode(input.barcode)) {
        throw new BadRequestException(
          'Invalid barcode format. Must be 47 or 48 digits.',
        );
      }
    }

    const payable = accountPayableRepository.create({
      status: PayableStatus.PENDING,
      amount: {
        amountMicros: input.amount * 1000000,
        currencyCode: 'BRL',
      },
      dueDate: input.dueDate.toISOString(),
      companyId: input.companyId,
      /* @kvoip-woulz proprietary:begin */
      paymentType: input.paymentType ?? null,
      /* @kvoip-woulz proprietary:end */
      barcode: input.barcode,
      message: input.message,
      cpfCnpj: input.cpfCnpj || company.cpfCnpj,
    });

    const savedPayable = await accountPayableRepository.save(payable);

    this.logger.log(`Payable created: ${savedPayable.id}`);

    return savedPayable;
  }

  // ============================================
  // GENERATE BANK SLIP
  // ============================================

  async generateBankSlip(
    workspaceId: string,
    registerId: string,
  ): Promise<BankSlipResponse> {
    this.logger.log(`Generating bank slip for register ${registerId}`);

    const financialRegisterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const register = await financialRegisterRepository.findOne({
      where: { id: registerId },
      relations: ['company'],
    });

    if (!register) {
      throw new NotFoundException(`Account receivable ${registerId} not found`);
    }

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
        { shouldBypassPermissionChecks: true },
      );

    /* @kvoip-woulz proprietary:begin */
    if (!register.amount || !register.dueDate) {
      throw new Error('Amount and due date are required to generate bank slip');
    }
    /* @kvoip-woulz proprietary:end */

    const chargeData = {
      id: registerId,
      authorId: register.createdBy?.workspaceMemberId || 'system',
      seuNumero: register.documentNumber || `REG-${registerId.substring(0, 8)}`,
      valorNominal: register.amount.amountMicros / 1000000,
      dataVencimento: register.dueDate,
      numDiasAgenda: 30,
      pagador: {
        nome: register.company?.name || 'Cliente',
        cpfCnpj: this.removeSpecialCharacters(register.cpfCnpj || ''),
        tipoPessoa: this.getTipoPessoa(register.cpfCnpj || ''),
        endereco: register.company?.address?.addressStreet1 || '',
        cidade: register.company?.address?.addressCity || '',
        uf: register.company?.address?.addressState || 'SP',
        cep: this.removeSpecialCharacters(
          register.company?.address?.addressPostcode || '',
        ),
      },
      mensagem: {
        linha1: 'Pagamento de serviços de telefonia',
      },
    };

    const chargeResponse =
      await this.interApiService.issueChargeAndStoreAttachment(
        workspaceId,
        attachmentRepository,
        chargeData,
      );

    await financialRegisterRepository.update(registerId, {
      bankSlipLink: chargeResponse.bankSlipPdfUrl || '',
      documentNumber:
        chargeResponse.codigoSolicitacao || register.documentNumber,
    });

    this.logger.log(`Bank slip generated for register ${registerId}`);

    return {
      bankSlipLink: chargeResponse.bankSlipPdfUrl || '',
      barcode: chargeResponse.linhaDigitavel || '',
      documentNumber: chargeResponse.codigoSolicitacao || '',
      dueDate: new Date(register.dueDate),
    };
  }

  // ============================================
  // GENERATE PIX CODE
  // ============================================

  async generatePixCode(
    workspaceId: string,
    registerId: string,
  ): Promise<PixCodeResponse> {
    this.logger.log(`Generating PIX code for register ${registerId}`);

    const financialRegisterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const register = await financialRegisterRepository.findOne({
      where: { id: registerId },
    });

    if (!register) {
      throw new NotFoundException(`Financial register ${registerId} not found`);
    }

    // TODO: Implement actual Inter PIX API call
    // This is a placeholder for now
    const pixResponse = {
      pixKey: 'pix-key-placeholder',
      pixCode: 'pix-code-placeholder',
      qrCodeBase64: 'qr-code-base64-placeholder',
    };

    // Update register with PIX info
    await financialRegisterRepository.update(registerId, {
      pixKey: pixResponse.pixKey,
    });

    this.logger.log(`PIX code generated for register ${registerId}`);

    return {
      pixKey: pixResponse.pixKey,
      pixCode: pixResponse.pixCode,
      qrCode: pixResponse.qrCodeBase64,
    };
  }

  // ============================================
  // PROCESS RECHARGE
  // ============================================

  async processRecharge(
    workspaceId: string,
    registerId: string,
  ): Promise<void> {
    this.logger.log(`Processing recharge for register ${registerId}`);

    const financialRegisterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const register = await financialRegisterRepository.findOne({
      where: { id: registerId },
      relations: ['company'],
    });

    if (!register) {
      throw new NotFoundException(`Financial register ${registerId} not found`);
    }

    if (!register.isRecharge) {
      throw new BadRequestException(
        'Register is not marked as a telephony recharge',
      );
    }

    /* @kvoip-woulz proprietary:begin */
    if (!register.amount) {
      throw new BadRequestException('Amount is required to process recharge');
    }
    /* @kvoip-woulz proprietary:end */

    // Get recharge amount
    const rechargeAmount = register.amount.amountMicros / 1000000;

    this.logger.log(
      `Adding ${rechargeAmount} to telephony balance for company ${register.companyId}`,
    );

    // TODO: Implement actual telephony recharge via SOAP client
    // This is a placeholder for future integration
    // await this.workspaceTelephonyService.addBalance(
    //   workspaceId,
    //   register.company.techPrefix,
    //   rechargeAmount
    // );

    this.logger.log(
      `Recharge processed successfully for register ${registerId}`,
    );
  }

  // ============================================
  // CHECK OVERDUE REGISTERS
  // ============================================

  async checkOverdueRegisters(
    workspaceId: string,
    overdueDays: number = 1,
  ): Promise<OverdueCheckResult> {
    this.logger.log(
      `Checking overdue registers for workspace ${workspaceId} (${overdueDays} days)`,
    );

    const financialRegisterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const overdueDate = new Date();

    overdueDate.setDate(overdueDate.getDate() - overdueDays);

    const overdueRegisters = await financialRegisterRepository.find({
      where: {
        status: ReceivableStatus.PENDING,
        dueDate: LessThan(overdueDate.toISOString()),
      },
    });

    let markedOverdue = 0;
    let excludedRecharges = 0;

    for (const register of overdueRegisters) {
      if (register.isRecharge) {
        excludedRecharges++;
        continue;
      }

      await financialRegisterRepository.update(register.id, {
        status: ReceivableStatus.OVERDUE,
      });

      markedOverdue++;

      this.logger.log(`Register ${register.id} marked as overdue`);

      // TODO: Trigger notification/alert
      // await this.notificationService.sendOverdueAlert(register);
    }

    const result = {
      totalChecked: overdueRegisters.length,
      markedOverdue,
      excludedRecharges,
    };

    this.logger.log(
      `Overdue check complete: ${JSON.stringify(result, null, 2)}`,
    );

    return result;
  }

  // ============================================
  // UPDATE STATUS
  // ============================================

  async updateStatus(
    workspaceId: string,
    registerId: string,
    newStatus: ReceivableStatus,
  ): Promise<AccountReceivableWorkspaceEntity> {
    this.logger.log(
      `Updating status for register ${registerId} to ${newStatus}`,
    );

    const financialRegisterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AccountReceivableWorkspaceEntity>(
        workspaceId,
        'accountReceivable',
        { shouldBypassPermissionChecks: true },
      );

    const register = await financialRegisterRepository.findOne({
      where: { id: registerId },
    });

    if (!register) {
      throw new NotFoundException(`Financial register ${registerId} not found`);
    }

    this.validationService.validateReceivableStatusTransition(
      register.status,
      newStatus,
    );

    await financialRegisterRepository.update(registerId, {
      status: newStatus,
    });

    const updatedRegister = await financialRegisterRepository.findOne({
      where: { id: registerId },
    });

    this.logger.log(`Status updated for register ${registerId}`);

    return updatedRegister!;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private removeSpecialCharacters(str: string): string {
    return str.replace(/\D/g, '');
  }

  private getTipoPessoa(cpfCnpj: string): 'FISICA' | 'JURIDICA' {
    const digitsOnly = this.removeSpecialCharacters(cpfCnpj);

    return digitsOnly.length === 11 ? 'FISICA' : 'JURIDICA';
  }
}
