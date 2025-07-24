/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FocusNFeResponse } from 'src/modules/focus-nfe/types/FocusNFeResponse.type';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { FiscalNote } from 'src/modules/focus-nfe/types/NotaFiscal.type';
import {
  validateNFCom,
  validateNFSe,
} from 'src/modules/focus-nfe/utils/validateNF';

type NFValidator = (data: FiscalNote) => boolean;

@Injectable()
export class FocusNFeService {
  constructor(private readonly environmentService: TwentyConfigService) {}

  private createAxiosInstance(token: string): AxiosInstance {
    const FOCUS_NFE_BASE_URL =
      this.environmentService.get('FOCUS_NFE_BASE_URL');

    return axios.create({
      baseURL: FOCUS_NFE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: token,
        password: '',
      },
    });
  }

  private async makeRequest(
    token: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    data?: unknown,
  ): Promise<FocusNFeResponse> {
    const api = this.createAxiosInstance(token);

    try {
      const response = await api.request({
        url: endpoint,
        method,
        data,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.erro ||
          error.message ||
          'Request failed';

        return {
          success: false,
          error: errorMessage,
          data: error.response?.data,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private nfStrategies: Record<
    'nfcom' | 'nfse',
    { validate: NFValidator; endpoint: string }
  > = {
    nfcom: { validate: validateNFCom, endpoint: '/nfcom' },
    nfse: { validate: validateNFSe, endpoint: '/nfse' },
    // nfe: { validate: validateNFe, endpoint: '/nfe' },
    // nfce: { validate: validateNFCe, endpoint: '/nfce' },
  };

  async issueNF(
    type: keyof typeof this.nfStrategies,
    data: FiscalNote,
    referenceCode: string,
    token: string,
  ): Promise<FocusNFeResponse> {
    const strategy = this.nfStrategies[type];

    if (!strategy.validate(data)) {
      return {
        success: false,
        error: `Invalid ${type.toUpperCase()} data. Please check all required fields.`,
      };
    }

    const endpoint = `${strategy.endpoint}?ref=${referenceCode}`;

    return this.makeRequest(token, endpoint, 'POST', data);
  }

  async cancelNote(
    type: NfType,
    referenceCode: string,
    reason: string,
    token: string,
  ): Promise<FocusNFeResponse> {
    const endpoint =
      type === NfType.NFSE ? `/nfse/${referenceCode}` : `/nfe/${referenceCode}`;

    return this.makeRequest(token, endpoint, 'DELETE', {
      justificativa: reason,
    });
  }

  async getNoteStatus(
    type: string,
    referenceCode: string,
    token: string,
  ): Promise<FocusNFeResponse> {
    const endpoint =
      type === NfType.NFSE
        ? `/nfse/${referenceCode}`
        : `/nfcom/${referenceCode}`;

    return this.makeRequest(token, endpoint, 'GET');
  }

  async getCodigoMunicipio(nomeMunicipio: string, token: string) {
    const response = await this.makeRequest(
      token,
      `/municipios?nome_municipio=${nomeMunicipio}`,
      'GET',
    );

    return response.data[0].codigo_municipio;
  }
}
