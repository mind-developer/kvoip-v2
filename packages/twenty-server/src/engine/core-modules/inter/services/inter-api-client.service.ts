/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';

import { AxiosInstance, AxiosResponse } from 'axios';

import { InterApiException } from 'src/engine/core-modules/inter/exceptions/inter-api.exception';
import {
  InterChargeRequest,
  InterChargeResponse,
  InterGetChargePDFResponse,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';

@Injectable()
export class InterApiClientService {
  private readonly logger = new Logger(InterApiClientService.name);
  private readonly interInstance: AxiosInstance;

  constructor(private readonly interInstanceService: InterInstanceService) {
    this.interInstance = this.interInstanceService.getInterAxiosInstance();
  }

  /**
   * Cria uma cobrança (bolepix) na Inter
   * POST /cobranca/v3/cobrancas
   */
  async createCharge(
    chargeData: InterChargeRequest,
  ): Promise<InterChargeResponse> {
    try {
      this.logger.log(`Creating charge with code: ${chargeData.seuNumero}`);

      const response = await this.interInstance.post<
        InterChargeResponse,
        AxiosResponse<InterChargeResponse, InterChargeRequest>,
        InterChargeRequest
      >('/cobranca/v3/cobrancas', chargeData);

      return response.data;
    } catch (error) {
      this.logger.error('Failed to create charge', {
        chargeCode: chargeData.seuNumero,
        error,
      });

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Obtém o PDF de uma cobrança
   * GET /cobranca/v3/cobrancas/:interChargeId/pdf
   */
  async getChargePdf(interChargeId: string): Promise<string> {
    try {
      this.logger.log(`Getting PDF for charge: ${interChargeId}`);

      const response = await this.interInstance.get<InterGetChargePDFResponse>(
        `/cobranca/v3/cobrancas/${interChargeId}/pdf`,
      );

      return response.data.pdf;
    } catch (error) {
      this.logger.error('Failed to get charge PDF', {
        interChargeId,
        error,
      });

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Paga um boleto (sandbox apenas)
   * POST /cobranca/v3/cobrancas/:interChargeCode/pagar
   */
  async payCharge(interChargeCode: string): Promise<void> {
    try {
      this.logger.log(`Paying charge in sandbox: ${interChargeCode}`);

      await this.interInstance.post(
        `/cobranca/v3/cobrancas/${interChargeCode}/pagar`,
        {
          pagarCom: 'BOLETO',
        },
      );
    } catch (error) {
      this.logger.error('Failed to pay charge', {
        interChargeCode,
        error,
      });

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Obtém o saldo da conta
   * GET /v1/balance
   */
  async getAccountBalance(): Promise<unknown> {
    try {
      this.logger.log('Getting account balance');

      const response = await this.interInstance.get('/v1/balance');

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get account balance', { error });

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Obtém informações da conta
   * GET /v1/account
   */
  async getAccountInfo(): Promise<unknown> {
    try {
      this.logger.log('Getting account info');

      const response = await this.interInstance.get('/v1/account');

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get account info', { error });

      throw InterApiException.fromAxiosError(error);
    }
  }
}
