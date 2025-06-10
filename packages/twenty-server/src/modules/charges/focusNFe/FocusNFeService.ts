/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { FocusNFeResponse } from 'src/modules/charges/focusNFe/types/FocusNFeResponse.type';
import { NfStatus } from 'src/modules/charges/types/NfStatus';
import { NfType } from 'src/modules/charges/types/NfType';
import { FiscalNote, NFSe } from 'src/modules/charges/types/NotaFiscal.type';

@Injectable()
export class FocusNFeService {
  private api: AxiosInstance;
  private readonly baseUrl = process.env.FOCUS_NFE_BASE_URL;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: 'hml-token',
        password: '',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`,
        );

        return config;
      },
      (error) => {
        console.error('Request error:', error);

        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('Response error:', error);

        if (error.response) {
          const { status, data } = error.response;

          console.error(`HTTP ${status}:`, data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
      },
    );
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    data?: unknown,
  ): Promise<FocusNFeResponse> {
    try {
      const response = await this.api.request({
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

  async issueNFSe(nfse: NFSe, requestCode: string): Promise<FocusNFeResponse> {
    if (!this.validateNFSe(nfse)) {
      return {
        success: false,
        error: 'Invalid NFSe data. Please check all required fields.',
      };
    }

    return this.makeRequest(`/nfse?ref=${requestCode}`, 'POST', nfse);
  }

  async cancelNote(
    type: NfType,
    requestCode: string,
    reason: string,
  ): Promise<FocusNFeResponse> {
    const endpoint =
      type === NfType.NFSE ? `/nfse/${requestCode}` : `/nfe/${requestCode}`;

    return this.makeRequest(endpoint, 'DELETE', { justificativa: reason });
  }

  async getNoteStatus(
    type: NfType,
    requestCode: string,
  ): Promise<FocusNFeResponse> {
    const endpoint =
      type === NfType.NFSE ? `/nfse/${requestCode}` : `/nfe/${requestCode}`;

    return this.makeRequest(endpoint, 'GET');
  }

  async reissueNote(
    type: NfType,
    note: FiscalNote,
    requestCode: string,
  ): Promise<FocusNFeResponse> {
    const noteToReissue = { ...note, status: NfStatus.DRAFT };

    if (type === NfType.NFSE) {
      return this.issueNFSe(noteToReissue as NFSe, requestCode);
    } else {
      return {
        success: false,
        error: 'Reissuing NFE is not implemented.',
      };
    }
  }

  async getCodigoMunicipio(nomeMunicipio: string) {
    const response = await this.makeRequest(
      `/municipios?nome_municipio=${nomeMunicipio}`,
      'GET',
    );

    return response.data[0].codigo_municipio;
  }

  validateNFSe(nfse: NFSe): boolean {
    const requiredFields = [
      nfse.data_emissao,
      nfse.prestador?.cnpj,
      nfse.prestador?.codigo_municipio,
      nfse.prestador?.inscricao_municipal,
      nfse.tomador?.cnpj,
      nfse.servico?.valor_servicos,
      nfse.servico?.iss_retido,
      nfse.servico?.item_lista_servico,
      nfse.servico?.discriminacao,
      nfse.servico?.codigo_tributario_municipio,
    ];

    const isValid = requiredFields.every((field) => {
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'boolean') return field === true || field === false;

      return field !== undefined && field !== null;
    });

    if (!isValid) {
      console.warn('NFSe validation failed. Missing required fields:', {
        data_emissao: !!nfse.data_emissao,
        prestador_cnpj: !!nfse.prestador?.cnpj,
        prestador_municipio: !!nfse.prestador?.codigo_municipio,
        prestador_inscricao: !!nfse.prestador?.inscricao_municipal,
        tomador_cpf_or_cnpj: !!nfse.tomador?.cnpj,
        servico_valor_servicos: nfse.servico?.valor_servicos !== undefined,
        servico_iss_retido: nfse.servico?.iss_retido !== undefined,
        servico_item_lista_servico: !!nfse.servico?.item_lista_servico,
        servico_discriminacao: !!nfse.servico?.discriminacao,
        servico_codigo_municipio: !!nfse.servico?.codigo_tributario_municipio,
      });
    }

    return isValid;
  }
}

export const focusNFeService = new FocusNFeService();
