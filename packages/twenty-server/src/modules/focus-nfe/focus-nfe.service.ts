/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FocusNFeResponse } from 'src/modules/focus-nfe/types/FocusNFeResponse.type';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { FiscalNote } from 'src/modules/focus-nfe/types/NotaFiscal.type';
import {
  validateNFCom,
  validateNFSe,
} from 'src/modules/focus-nfe/utils/validateNF';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { IsNull, Not } from 'typeorm';
import { compareDesc } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { buildNFComPayload, buildNFSePayload, getCurrentFormattedDate } from 'src/modules/focus-nfe/utils/nf-builder';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

type NFValidator = (data: FiscalNote) => boolean;

@Injectable()
export class FocusNFeService {
  private readonly logger = new Logger('FocusNFeService');

  constructor(
    private readonly environmentService: TwentyConfigService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

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
    // nfe: { validate: validateNFe, endpoint: '/nfe' },  // TODO: habilitar os demais modelos de NF
    // nfce: { validate: validateNFCe, endpoint: '/nfce' }, 
  };

  async preIssueNf(
    notaFiscal: NotaFiscalWorkspaceEntity,
    workspaceId: string,
    productObj?: ProductWorkspaceEntity,
  ): Promise<FocusNFeResponse | void> {

    const { company, focusNFe } = notaFiscal;

    const product = productObj ? productObj : notaFiscal.product;

    if (!product || !company || !focusNFe?.token) return;

    switch (notaFiscal.nfType) {
      case NfType.NFSE: {
        const lastInvoiceIssued = await this.getLastInvoiceIssued(workspaceId);

        if (!lastInvoiceIssued) return;

        const codMunicipioPrestador =
          await this.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );

        const codMunicipioTomador =
          await this.getCodigoMunicipio(
            notaFiscal.company?.address.addressCity || '',
            focusNFe?.token,
          );

        const nfse = buildNFSePayload(
          notaFiscal,
          codMunicipioPrestador,
          codMunicipioTomador,
          lastInvoiceIssued?.numeroRps,
        );
        
        // if (!nfse) return;

        // const result = await this.issueNF(
        //   'nfse',
        //   nfse,
        //   notaFiscal.id,
        //   focusNFe?.token,
        // );

        // return result;
      }

      case NfType.NFCOM: {
        const codMunicipioEmitente =
          await this.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );

        const codMunicipioTomador =
          await this.getCodigoMunicipio(
            notaFiscal.company?.address.addressCity || '',
            focusNFe?.token,
          );

        // const nfcom = buildNFComPayload(
        //   notaFiscal,
        //   codMunicipioEmitente,
        //   codMunicipioTomador,
        //   product,
        // );

        // if (!nfcom) return;

        this.logger.log(`DADOS DA NF:`);
        this.logger.log(`codMunicipioEmitente: ${codMunicipioEmitente}`);
        this.logger.log(`codMunicipioTomador: ${codMunicipioTomador}`);
        // this.logger.log(`nfcom: ${JSON.stringify(nfcom, null, 2)}`);

        // const result = await this.issueNF(
        //   'nfcom',
        //   nfcom,
        //   notaFiscal.id,
        //   focusNFe?.token,
        // );

        // return result;
      }
    }
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
      type === NfType.NFSE
        ? `/nfse/${referenceCode}`
        : `/nfcom/${referenceCode}`;

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

    this.logger.log(`getCodigoMunicipio: ${JSON.stringify(response, null, 2)}`);

    return response.data[0].codigo_municipio;
  }

  private getLastInvoiceIssued = async (
    workspaceId: string,
  ): Promise<
    | {
        id: string;
        numeroRps: number;
        dataEmissao: string;
      }
    | undefined
  > => {
    const LAST_NUMBER_RPS = this.environmentService.get('LAST_NUMBER_RPS');

    const notaFiscalRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<NotaFiscalWorkspaceEntity>(
        workspaceId,
        'notaFiscal',
        { shouldBypassPermissionChecks: true },
      );

    const invoiceIssued = await notaFiscalRepository.find({
      where: {
        nfType: NfType.NFSE,
        numeroRps: Not(IsNull()),
        dataEmissao: Not(IsNull()),
      },
    });

    const latestNFSe = invoiceIssued
      .filter((nf) => nf.dataEmissao)
      .sort((a, b) =>
        compareDesc(
          zonedTimeToUtc(new Date(a.dataEmissao || ''), 'America/Sao_Paulo'),
          zonedTimeToUtc(new Date(b.dataEmissao || ''), 'America/Sao_Paulo'),
        ),
      )[0];

    const latestNumeroRps = Number(latestNFSe?.numeroRps || 2000);

    if (LAST_NUMBER_RPS > latestNumeroRps) {
      return {
        id: '0',
        numeroRps: LAST_NUMBER_RPS,
        dataEmissao: getCurrentFormattedDate(),
      };
    }

    return {
      id: latestNFSe.id,
      numeroRps: latestNumeroRps,
      dataEmissao: latestNFSe.dataEmissao || '',
    };
  };
}
