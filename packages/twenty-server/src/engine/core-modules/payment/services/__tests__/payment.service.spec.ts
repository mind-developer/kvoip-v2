/* @kvoip-woulz proprietary */
import { NotFoundException } from '@nestjs/common';

import type { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import type { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import type { CreateChargeDto } from '../../dtos/create-charge.dto';
import { ChargeStatus } from '../../enums/charge-status.enum';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentProvider } from '../../enums/payment-provider.enum';
import { PaymentMethodNotSupportedException } from '../../exceptions/payment-method-not-supported.exception';
import type { PaymentProviderCapabilities } from '../../interfaces/payment-provider-capabilities.interface';
import type {
  BankSlipResponse,
  CancelChargeResponse,
  CreateChargeResponse,
  IPaymentProvider,
  ListChargesResponse,
  PaymentStatusResponse,
  RefundResponse,
} from '../../interfaces/payment-provider.interface';
import { PaymentService } from '../payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let mockORMManager: Pick<TwentyORMGlobalManager, 'getRepositoryForWorkspace'>;
  let mockRepository: {
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    findOne: jest.Mock;
  };
  let mockProvider: jest.Mocked<IPaymentProvider>;
  let capabilities: PaymentProviderCapabilities;

  const workspaceId = 'workspace-id';
  const integrationId = 'integration-id';
  const chargeId = 'charge-id';
  const chargeEntity = { id: 'charge-entity-id' } as ChargeWorkspaceEntity;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRepository = {
      create: jest.fn().mockReturnValue(chargeEntity),
      save: jest.fn().mockResolvedValue(chargeEntity),
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(chargeEntity),
    };

    mockORMManager = {
      getRepositoryForWorkspace: jest.fn().mockResolvedValue(mockRepository),
    };

    capabilities = {
      boleto: false,
      bolepix: false,
      pix: false,
      creditCard: false,
      debitCard: false,
      bankTransfer: false,
      refunds: false,
      partialRefunds: false,
      cancellation: false,
      updates: false,
      statusQuery: false,
      listCharges: false,
      installments: false,
      recurring: false,
      webhooks: false,
    };

    const defaultChargeResponse: CreateChargeResponse = {
      chargeId: 'provider-charge-id',
      externalChargeId: 'external-charge-id',
      status: ChargeStatus.PENDING,
      paymentMethod: PaymentMethod.BOLETO,
      amount: 100,
    };

    mockProvider = {
      capabilities,
      createBoletoCharge: jest.fn().mockResolvedValue(defaultChargeResponse),
      createPixCharge: jest.fn().mockResolvedValue(defaultChargeResponse),
      createBolepixCharge: jest.fn().mockResolvedValue(defaultChargeResponse),
      createCardCharge: jest.fn().mockResolvedValue(defaultChargeResponse),
      getBankSlipFile: jest.fn().mockResolvedValue({} as BankSlipResponse),
      getChargeStatus: jest.fn().mockResolvedValue({
        chargeId,
        externalChargeId: 'external',
        status: ChargeStatus.PENDING,
      } as PaymentStatusResponse),
      cancelCharge: jest.fn().mockResolvedValue({
        chargeId,
        externalChargeId: 'external',
        status: ChargeStatus.CANCELLED,
      } as CancelChargeResponse),
      refundCharge: jest.fn().mockResolvedValue({
        refundId: 'refund-id',
        chargeId,
        amount: 50,
        status: ChargeStatus.REFUNDED,
      } as RefundResponse),
      updateCharge: jest.fn().mockResolvedValue(defaultChargeResponse),
      listCharges: jest.fn().mockResolvedValue({
        charges: [defaultChargeResponse],
        total: 1,
        hasMore: false,
      } as ListChargesResponse),
    } as unknown as jest.Mocked<IPaymentProvider>;

    service = new PaymentService(
      mockORMManager as TwentyORMGlobalManager,
      mockProvider,
    );
  });

  const buildChargeDto = (
    overrides: Partial<CreateChargeDto> = {},
  ): CreateChargeDto =>
    ({
      amount: 100,
      paymentMethod: PaymentMethod.BOLETO,
      payerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        taxId: '12345678900',
      },
      description: 'Charge description',
      metadata: {
        key: 'value',
      },
      ...overrides,
    }) as CreateChargeDto;

  describe('getAvailablePaymentMethods', () => {
    it('returns only the supported methods based on provider capabilities', () => {
      capabilities.boleto = true;
      capabilities.pix = true;
      capabilities.creditCard = true;

      const available = service.getAvailablePaymentMethods(
        PaymentProvider.INTER,
      );

      expect(available).toEqual([
        PaymentMethod.BOLETO,
        PaymentMethod.PIX,
        PaymentMethod.CREDIT_CARD,
      ]);
    });
  });

  describe('createCharge', () => {
    it('creates a boleto charge and persists workspace entity', async () => {
      capabilities.boleto = true;

      const dueDate = new Date();
      const chargeDto = buildChargeDto({
        paymentMethod: PaymentMethod.BOLETO,
        dueDate,
      });

      const result = await service.createCharge({
        workspaceId,
        chargeDto,
        provider: PaymentProvider.INTER,
        integrationId,
      });

      expect(mockProvider.createBoletoCharge).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        amount: chargeDto.amount,
        dueDate,
        payerInfo: chargeDto.payerInfo,
        description: chargeDto.description,
        metadata: chargeDto.metadata,
      });
      expect(mockORMManager.getRepositoryForWorkspace).toHaveBeenCalledWith(
        workspaceId,
        'charge',
        {
          shouldBypassPermissionChecks: true,
        },
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: chargeDto.description,
        price: chargeDto.amount,
        quantity: 1,
        taxId: chargeDto.payerInfo.taxId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(chargeEntity);
      expect(result).toBe(chargeEntity);
    });

    it('throws when payment method is not supported by provider', async () => {
      const chargeDto = buildChargeDto({
        paymentMethod: PaymentMethod.PIX,
      });

      await expect(
        service.createCharge({
          workspaceId,
          chargeDto,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toBeInstanceOf(PaymentMethodNotSupportedException);
      expect(mockProvider.createPixCharge).not.toHaveBeenCalled();
    });

    it('throws when boleto charge is missing due date', async () => {
      capabilities.boleto = true;
      const chargeDto = buildChargeDto({
        paymentMethod: PaymentMethod.BOLETO,
        dueDate: undefined,
      });

      await expect(
        service.createCharge({
          workspaceId,
          chargeDto,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toThrow('Due date is required for boleto payments');
      expect(mockProvider.createBoletoCharge).not.toHaveBeenCalled();
    });

    it('throws when card payment does not include card data', async () => {
      capabilities.creditCard = true;
      const chargeDto = buildChargeDto({
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardData: undefined,
      });

      await expect(
        service.createCharge({
          workspaceId,
          chargeDto,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toThrow('Card data is required for card payments');
      expect(mockProvider.createCardCharge).not.toHaveBeenCalled();
    });

    it('routes card payments to createCardCharge with provided data', async () => {
      capabilities.creditCard = true;

      const chargeDto = buildChargeDto({
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardData: {
          cardNumber: '4111111111111111',
          cardHolderName: 'John Doe',
          expirationMonth: '12',
          expirationYear: '2035',
          cvv: '123',
        },
      });

      await service.createCharge({
        workspaceId,
        chargeDto,
        provider: PaymentProvider.INTER,
        integrationId,
      });

      expect(mockProvider.createCardCharge).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        amount: chargeDto.amount,
        cardData: chargeDto.cardData,
        payerInfo: chargeDto.payerInfo,
        description: chargeDto.description,
        metadata: chargeDto.metadata,
      });
    });
  });

  describe('getBankSlipFile', () => {
    it('delegates to payment provider', async () => {
      const response: BankSlipResponse = {
        fileUrl: 'https://example.com',
      };
      mockProvider.getBankSlipFile.mockResolvedValueOnce(response);

      const result = await service.getBankSlipFile({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
      });

      expect(mockProvider.getBankSlipFile).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
      });
      expect(result).toBe(response);
    });
  });

  describe('getChargeStatus', () => {
    it('returns status from provider', async () => {
      const response: PaymentStatusResponse = {
        chargeId,
        externalChargeId: 'external',
        status: ChargeStatus.PAID,
      };
      mockProvider.getChargeStatus.mockResolvedValueOnce(response);

      const result = await service.getChargeStatus({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
      });

      expect(mockProvider.getChargeStatus).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
      });
      expect(result).toBe(response);
    });
  });

  describe('cancelCharge', () => {
    it('throws when provider does not support cancellations', async () => {
      await expect(
        service.cancelCharge({
          workspaceId,
          chargeId,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toThrow(
        `Provider ${PaymentProvider.INTER} does not support charge cancellation`,
      );
      expect(mockProvider.cancelCharge).not.toHaveBeenCalled();
    });

    it('cancels the charge and updates workspace entity', async () => {
      capabilities.cancellation = true;

      const response: CancelChargeResponse = {
        chargeId,
        externalChargeId: 'ext',
        status: ChargeStatus.CANCELLED,
      };
      mockProvider.cancelCharge.mockResolvedValueOnce(response);

      const result = await service.cancelCharge({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
        reason: 'Customer request',
      });

      expect(mockProvider.cancelCharge).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
        reason: 'Customer request',
      });
      expect(mockRepository.update).toHaveBeenCalledWith(chargeId, {});
      expect(result).toBe(response);
    });
  });

  describe('refundCharge', () => {
    it('throws when refunds are not supported', async () => {
      await expect(
        service.refundCharge({
          workspaceId,
          chargeId,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toThrow(
        `Provider ${PaymentProvider.INTER} does not support refunds`,
      );
      expect(mockProvider.refundCharge).not.toHaveBeenCalled();
    });

    it('throws when partial refund requested but not supported', async () => {
      capabilities.refunds = true;
      capabilities.partialRefunds = false;

      await expect(
        service.refundCharge({
          workspaceId,
          chargeId,
          provider: PaymentProvider.INTER,
          integrationId,
          amount: 50,
        }),
      ).rejects.toThrow(
        `Provider ${PaymentProvider.INTER} does not support partial refunds`,
      );
      expect(mockProvider.refundCharge).not.toHaveBeenCalled();
    });

    it('refunds the charge and updates status', async () => {
      capabilities.refunds = true;
      capabilities.partialRefunds = true;

      const response: RefundResponse = {
        refundId: 'refund-id',
        chargeId,
        amount: 40,
        status: ChargeStatus.REFUNDED,
      };
      mockProvider.refundCharge.mockResolvedValueOnce(response);

      const result = await service.refundCharge({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
        amount: 40,
        reason: 'Customer returned product',
      });

      expect(mockProvider.refundCharge).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
        amount: 40,
        reason: 'Customer returned product',
      });
      expect(mockRepository.update).toHaveBeenCalledWith(chargeId, {});
      expect(result).toBe(response);
    });
  });

  describe('updateCharge', () => {
    it('delegates update to provider', async () => {
      const response: CreateChargeResponse = {
        chargeId,
        externalChargeId: 'external',
        status: ChargeStatus.PROCESSING,
        paymentMethod: PaymentMethod.BOLETO,
        amount: 200,
      };
      mockProvider.updateCharge.mockResolvedValueOnce(response);

      const result = await service.updateCharge({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
        updates: { amount: 200 },
      });

      expect(mockProvider.updateCharge).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
        updates: { amount: 200 },
      });
      expect(result).toBe(response);
    });
  });

  describe('listCharges', () => {
    it('delegates listing to provider', async () => {
      const response: ListChargesResponse = {
        charges: [],
        total: 0,
        hasMore: false,
      };
      mockProvider.listCharges.mockResolvedValueOnce(response);

      const result = await service.listCharges({
        workspaceId,
        provider: PaymentProvider.INTER,
        integrationId,
        filters: {
          status: ChargeStatus.PENDING,
        },
      });

      expect(mockProvider.listCharges).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        filters: {
          status: ChargeStatus.PENDING,
        },
      });
      expect(result).toBe(response);
    });
  });

  describe('syncChargeStatus', () => {
    it('updates existing charge entity with provider status', async () => {
      const statusResponse: PaymentStatusResponse = {
        chargeId,
        externalChargeId: 'external',
        status: ChargeStatus.PAID,
      };
      mockProvider.getChargeStatus.mockResolvedValueOnce(statusResponse);

      const result = await service.syncChargeStatus({
        workspaceId,
        chargeId,
        provider: PaymentProvider.INTER,
        integrationId,
      });

      expect(mockProvider.getChargeStatus).toHaveBeenCalledWith({
        workspaceId,
        integrationId,
        chargeId,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: chargeId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(chargeEntity);
      expect(result).toBe(chargeEntity);
    });

    it('throws NotFoundException when charge does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.syncChargeStatus({
          workspaceId,
          chargeId,
          provider: PaymentProvider.INTER,
          integrationId,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
