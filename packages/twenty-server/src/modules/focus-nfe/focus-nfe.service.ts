/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { msg } from '@lingui/core/macro';
import { Injectable, Logger } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

import { compareDesc } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FocusNFeResponse } from 'src/modules/focus-nfe/types/FocusNFeResponse.type';
import { InvoiceFocusNFe } from 'src/modules/focus-nfe/types/InvoiceFocusNFe.type';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import {
  buildNFComPayload,
  buildNFSePayload,
  getCurrentFormattedDate,
} from 'src/modules/focus-nfe/utils/nf-builder';
import {
  validateNFCom,
  validateNFSe,
} from 'src/modules/focus-nfe/utils/validateNF';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { IsNull, Not } from 'typeorm';

type NFValidator = (data: InvoiceFocusNFe) => boolean;

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
    invoice: InvoiceWorkspaceEntity,
    workspaceId: string,
    productObj?: ProductWorkspaceEntity,
  ): Promise<FocusNFeResponse | void> {
    const { company, focusNFe } = invoice;

    const product = productObj ? productObj : invoice.product;
    let result: FocusNFeResponse | undefined = undefined;

    if (!product || !company || !focusNFe?.token) return;

    switch (invoice.nfType) {
      case NfType.NFSE: {
        const lastInvoiceIssued = await this.getLastInvoiceIssued(workspaceId);

        if (!lastInvoiceIssued) return;

        let codMunicipioPrestador: string;
        let codMunicipioTomador: string;

        try {
          codMunicipioPrestador = await this.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao buscar código do município do prestador: ${error.message}`,
          );
          return {
            success: false,
            error:
              msg`Error in the city of the provider` +
              ' ' +
              focusNFe?.city +
              ' - ' +
              error.message,
            data: null,
          };
        }

        try {
          codMunicipioTomador = await this.getCodigoMunicipio(
            invoice.company?.address.addressCity || '',
            focusNFe?.token,
          );
        } catch (error) {
          return {
            success: false,
            error:
              msg`Error in the city of the recipient` +
              ' ' +
              invoice.company?.address.addressCity +
              ' - ' +
              error.message,
            data: null,
          };
        }

        const nfse = buildNFSePayload(
          invoice,
          codMunicipioPrestador,
          codMunicipioTomador,
          lastInvoiceIssued?.rpsNumber,
        );

        if (!nfse) {
          this.logger.log(
            'Erro ao construir o objeto de envio para emissão da NF-se.',
          );
          return;
        }

        this.logger.log(`DADOS DA NF:`);
        this.logger.log(`codMunicipioPrestador: ${codMunicipioPrestador}`);
        this.logger.log(`codMunicipioTomador: ${codMunicipioTomador}`);
        this.logger.log(`nfse: ${JSON.stringify(nfse, null, 2)}`);

        result = await this.issueNF('nfse', nfse, invoice.id, focusNFe?.token);

        // adiciona o rps no result
        result.data = {
          ...result.data,
          rps: lastInvoiceIssued?.rpsNumber,
        };

        this.logger.log(`RESPONSE NF: ${JSON.stringify(result, null, 2)}`);

        break;
      }

      case NfType.NFCOM: {
        let codMunicipioEmitente: string;
        let codMunicipioTomador: string;

        try {
          codMunicipioEmitente = await this.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao buscar código do município do emitente: ${error.message}`,
          );
          return {
            success: false,
            error:
              msg`Error in the city of the emitter` +
              ' ' +
              focusNFe?.city +
              ' - ' +
              error.message,
            data: null,
          };
        }

        try {
          codMunicipioTomador = await this.getCodigoMunicipio(
            invoice.company?.address.addressCity || '',
            focusNFe?.token,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao buscar código do município do tomador: ${error.message}`,
          );
          return {
            success: false,
            error:
              msg`Error in the city of the recipient` +
              ' ' +
              invoice.company?.address.addressCity +
              ' - ' +
              error.message,
            data: null,
          };
        }

        const nfcom = buildNFComPayload(
          invoice,
          codMunicipioEmitente,
          codMunicipioTomador,
          product,
        );

        if (!nfcom) {
          this.logger.log(
            'Erro ao construir o objeto de envio para emissão da NF-Com.',
          );
          return;
        }

        this.logger.log(`DADOS DA NF:`);
        this.logger.log(`codMunicipioEmitente: ${codMunicipioEmitente}`);
        this.logger.log(`codMunicipioTomador: ${codMunicipioTomador}`);
        this.logger.log(`nfcom: ${JSON.stringify(nfcom, null, 2)}`);

        result = await this.issueNF(
          'nfcom',
          nfcom,
          invoice.id,
          focusNFe?.token,
        );

        this.logger.log(`RESPONSE NF: ${JSON.stringify(result, null, 2)}`);

        break;
      }
    }

    return result;
  }

  async issueNF(
    type: keyof typeof this.nfStrategies,
    data: InvoiceFocusNFe,
    referenceCode: string,
    token: string,
  ): Promise<FocusNFeResponse> {
    this.logger.log(`REFERENCE CODE: ${referenceCode}`);

    const strategy = this.nfStrategies[type];

    if (!strategy.validate(data)) {
      return {
        success: false,
        error:
          msg`Invalid` +
          ' ' +
          type.toUpperCase() +
          ' ' +
          msg`data. Please check all required fields.`,
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

    if (!response.success) {
      const errorMessage =
        response.error || msg`Error to search the city code`.toString();
      this.logger.error(`Erro na API Focus NFe: ${errorMessage}`);
      throw new Error(
        msg`Error to search the city code` +
          ' ' +
          nomeMunicipio +
          ': ' +
          errorMessage,
      );
    }

    if (
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      const errorMessage =
        msg`City` + ' ' + nomeMunicipio + ' ' + msg`not found`.toString();
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return response.data[0].codigo_municipio;
  }

  private getLastInvoiceIssued = async (
    workspaceId: string,
  ): Promise<
    | {
        id: string;
        rpsNumber: number;
        issueDate: string;
      }
    | undefined
  > => {
    const LAST_NUMBER_RPS = this.environmentService.get('LAST_NUMBER_RPS');

    const invoiceRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<InvoiceWorkspaceEntity>(
        workspaceId,
        'invoice',
        { shouldBypassPermissionChecks: true },
      );

    const invoiceIssued = await invoiceRepository.find({
      where: {
        nfType: NfType.NFSE,
        rpsNumber: Not(IsNull()),
        issueDate: Not(IsNull()),
      },
    });

    const latestNFSe = invoiceIssued
      .filter((nf) => nf.issueDate)
      .sort((a, b) =>
        compareDesc(
          toZonedTime(new Date(a.issueDate || ''), 'America/Sao_Paulo'),
          toZonedTime(new Date(b.issueDate || ''), 'America/Sao_Paulo'),
        ),
      )[0];

    const latestNumeroRps = Number(latestNFSe?.rpsNumber);

    if (LAST_NUMBER_RPS > latestNumeroRps) {
      return {
        id: '0',
        rpsNumber: LAST_NUMBER_RPS,
        issueDate: getCurrentFormattedDate(),
      };
    }

    return {
      id: latestNFSe.id,
      rpsNumber: latestNumeroRps,
      issueDate: latestNFSe.issueDate || '',
    };
  };
}
