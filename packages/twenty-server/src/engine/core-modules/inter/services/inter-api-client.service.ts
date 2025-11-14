/* @kvoip-woulz proprietary */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { AxiosInstance, AxiosResponse } from 'axios';
import { plainToInstance } from 'class-transformer';
import { type ValidationError, validate } from 'class-validator';

import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';

import { InterApiException } from 'src/engine/core-modules/inter/exceptions/inter-api.exception';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import {
  InterChargeRequest,
  InterChargeResponse,
  InterGetChargePDFResponse,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';

@Injectable()
export class InterApiClientService {
  private readonly logger = new Logger(InterApiClientService.name);

  constructor(private readonly interInstanceService: InterInstanceService) {}

  /**
   * Gets the appropriate axios instance for the given integration
   * @param integration Optional workspace-specific integration. If not provided, uses global billing integration
   */
  private getAxiosInstance(integration?: InterIntegration): AxiosInstance {
    return this.interInstanceService.getInterAxiosInstance(integration);
  }

  /**
   * Validates charge data against InterCreateChargeDto
   * @param chargeData Charge request data to validate
   * @throws BadRequestException if validation fails
   */
  private async validateChargeData(
    chargeData: InterChargeRequest,
  ): Promise<void> {
    const dto = plainToInstance(InterCreateChargeDto, chargeData);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);
      throw new BadRequestException(
        `Invalid charge data: ${errorMessages.join(', ')}`,
      );
    }
  }

  /**
   * Formats validation errors into readable messages
   * @param errors Array of validation errors
   * @returns Array of formatted error messages
   */
  private formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const childMessages = this.formatValidationErrors(error.children);
        return childMessages.map((msg) => `${error.property}: ${msg}`);
      }

      return [];
    });
  }

  /**
   * Cria uma cobrança (bolepix) na Inter
   * POST /cobranca/v3/cobrancas
   * @param chargeData Charge request data
   * @param integration Optional workspace-specific integration
   */
  async createCharge(
    chargeData: InterChargeRequest,
    integration?: InterIntegration,
  ): Promise<InterChargeResponse> {
    try {
      this.logger.log(`Creating charge with code: ${chargeData.seuNumero}`);

      await this.validateChargeData(chargeData);

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.post<
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

      // Re-throw BadRequestException for validation errors
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Obtém o PDF de uma cobrança
   * GET /cobranca/v3/cobrancas/:interChargeId/pdf
   * @param interChargeId Charge ID
   * @param integration Optional workspace-specific integration
   */
  async getChargePdf(
    interChargeId: string,
    integration?: InterIntegration,
  ): Promise<string> {
    try {
      this.logger.log(`Getting PDF for charge: ${interChargeId}`);

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get<InterGetChargePDFResponse>(
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
   * @param interChargeCode Charge code
   * @param integration Optional workspace-specific integration
   */
  async payCharge(
    interChargeCode: string,
    integration?: InterIntegration,
  ): Promise<void> {
    try {
      this.logger.log(`Paying charge in sandbox: ${interChargeCode}`);

      const axiosInstance = this.getAxiosInstance(integration);
      await axiosInstance.post(
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
   * @param integration Optional workspace-specific integration
   */
  async getAccountBalance(integration?: InterIntegration): Promise<unknown> {
    try {
      this.logger.log('Getting account balance');

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get('/v1/balance');

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get account balance', { error });

      throw InterApiException.fromAxiosError(error);
    }
  }

  /**
   * Obtém informações da conta
   * GET /v1/account
   * @param integration Optional workspace-specific integration
   */
  async getAccountInfo(integration?: InterIntegration): Promise<unknown> {
    try {
      this.logger.log('Getting account info');

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get('/v1/account');

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get account info', { error });

      throw InterApiException.fromAxiosError(error);
    }
  }
}
