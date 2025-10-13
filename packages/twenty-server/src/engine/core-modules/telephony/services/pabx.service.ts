/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';

import https from 'https';

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type PabxServiceInterface } from 'src/modules/telephony/interfaces/pabxService.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type CreateDialingPlanInput } from 'src/modules/telephony/dtos/create-dialing-plan.input';
import { type UpdateRoutingRulesInput } from 'src/modules/telephony/dtos/update-routing-rules.input';
import { type InsereEmpresa } from 'src/modules/telephony/types/Create/InsereEmpresa.type';
import { type InsereTronco } from 'src/modules/telephony/types/Create/InsereTronco.type';
import { type ExtetionBody } from 'src/modules/telephony/types/Extention.type';
import {
  type ListCommonArgs,
  type ListExtentionsArgs,
} from 'src/modules/telephony/types/pabx.type';

@Injectable()
export class PabxService implements PabxServiceInterface {
  private pabxAxiosInstance: AxiosInstance;
  private readonly logger = new Logger(PabxService.name);

  constructor(private readonly environmentService: TwentyConfigService) {
    const PABX_ENV = this.environmentService.get('PABX_ENV');
    const PABX_URL =
      PABX_ENV === NodeEnvironment.PRODUCTION
        ? this.environmentService.get('PABX_URL')
        : this.environmentService.get('PABX_TEST_URL');

    const PABX_USER =
      PABX_ENV === NodeEnvironment.PRODUCTION
        ? this.environmentService.get('PABX_USER')
        : this.environmentService.get('PABX_TEST_USER');

    const PABX_TOKEN =
      PABX_ENV === NodeEnvironment.PRODUCTION
        ? this.environmentService.get('PABX_TOKEN')
        : this.environmentService.get('PABX_TEST_TOKEN');

    this.pabxAxiosInstance = axios.create({
      baseURL: PABX_URL,
      headers: {
        usuario: PABX_USER,
        token: PABX_TOKEN,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  createExtention: (data: ExtetionBody) => Promise<AxiosResponse> = async (
    data,
  ) => {
    const createRamalResponse = await this.pabxAxiosInstance.post(
      '/inserir_ramal',
      data,
    );

    return createRamalResponse;
  };

  updateExtention: (data: ExtetionBody) => Promise<AxiosResponse> = async (
    data,
  ) => {
    const updateRamalResponse = await this.pabxAxiosInstance.post(
      '/alterar_ramal',
      data,
    );

    return updateRamalResponse;
  };

  listExtentions: (args?: ListExtentionsArgs) => Promise<AxiosResponse> =
    async (args) => {
      const listExtentionsResponse = await this.pabxAxiosInstance.get(
        '/listar_ramais',
        {
          data: { ...(args ?? undefined) },
        },
      );
      return listExtentionsResponse;
    };

  listDialingPlans: (args: ListCommonArgs) => Promise<AxiosResponse> = async (
    args,
  ) => {
    const dialingPlansResponse = await this.pabxAxiosInstance.get(
      '/listar_planos_discagem',
      {
        data: args,
      },
    );

    return dialingPlansResponse;
  };

  listDids: (args: ListCommonArgs) => Promise<AxiosResponse> = async (args) => {
    const listDidsResponse = await this.pabxAxiosInstance.get('/listar_dids', {
      data: args,
    });

    return listDidsResponse;
  };

  listCampaigns: (args: ListCommonArgs) => Promise<AxiosResponse> = async (
    args,
  ) => {
    const listCampaignsResponse = await this.pabxAxiosInstance.get(
      '/listar_campanhas',
      {
        data: args,
      },
    );

    return listCampaignsResponse;
  };

  listIntegrationFlows: (args: ListCommonArgs) => Promise<AxiosResponse> =
    async (args) => {
      const integrationFlowsResponse = await this.pabxAxiosInstance.get(
        '/listar_fluxos_integracao',
        {
          data: args,
        },
      );

      return integrationFlowsResponse;
    };

  createCompany: (data: InsereEmpresa) => Promise<AxiosResponse> = async (
    data,
  ) => {
    try {
      this.logger.log(`Creating company with name: ${data.nome}`);

      const createCompanyResponse = await this.pabxAxiosInstance.post(
        '/inserir_cliente',
        { dados: data },
      );

      this.logger.log(`Company created successfully: ${data.nome}`);

      return createCompanyResponse;
    } catch (error) {
      this.logger.error(
        `Failed to create company: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  createTrunk: (data: InsereTronco) => Promise<AxiosResponse> = async (
    data,
  ) => {
    try {
      this.logger.log(`Creating trunk with name: ${data.nome}`);

      const createTrunkResponse = await this.pabxAxiosInstance.post(
        '/inserir_tronco',
        { dados: data },
      );

      this.logger.log(`Trunk created successfully: ${data.nome}`);

      return createTrunkResponse;
    } catch (error) {
      console.log('error: ', error);

      this.logger.error(
        `Failed to create trunk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  listTrunk: (cliente_id: number) => Promise<AxiosResponse> = async (
    cliente_id,
  ) => {
    try {
      const listTrunkResponse = await this.pabxAxiosInstance.get(
        '/listar_tronco',
        { params: { cliente_id: cliente_id } },
      );

      return listTrunkResponse;
    } catch (error) {
      this.logger.error(`Failed to list trunk: ${error.message}`, error.stack);
      throw error;
    }
  };

  createDialingPlan: (data: CreateDialingPlanInput) => Promise<AxiosResponse> =
    async (data) => {
      try {
        this.logger.log(`Creating dialing plan with name: ${data.nome}`);

        const payload = {
          dados: {
            plano_discagem_id: data.plano_discagem_id,
            nome: data.nome,
            cliente_id: data.cliente_id,
          },
        };

        const createDialingPlanResponse = await this.pabxAxiosInstance.post(
          '/inserir_plano_discagem',
          payload,
        );

        this.logger.log(`Dialing plan created successfully: ${data.nome}`);

        return createDialingPlanResponse;
      } catch (error) {
        this.logger.error(
          `Failed to create dialing plan: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    };

  updateRoutingRules: (
    data: UpdateRoutingRulesInput,
  ) => Promise<AxiosResponse> = async (data) => {
    try {
      this.logger.log(
        `Updating routing rules for dialing plan ID: ${data.plano_discagem_id}`,
      );

      const updateRoutingRulesResponse = await this.pabxAxiosInstance.put(
        '/alterar_regras_roteamento',
        data,
      );

      this.logger.log(
        `Routing rules updated successfully for dialing plan ID: ${data.plano_discagem_id}`,
      );

      return updateRoutingRulesResponse;
    } catch (error) {
      this.logger.error(
        `Failed to update routing rules: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  listRegions: (id: number) => Promise<AxiosResponse> = async (id: number) => {
    try {
      const listRegionsResponse = await this.pabxAxiosInstance.get(
        '/listar_regioes',
        {
          params: {
            regiao_id: id,
          },
        },
      );

      return listRegionsResponse;
    } catch (error) {
      this.logger.error(
        `Failed to list regions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  /**
   * Verifica se um ramal já existe na API PABX
   * @param extensionNumber - Número da extensão a ser verificada
   * @returns Promise<boolean> - true se o ramal já existe, false caso contrário
   */
  checkExtensionExists: (extensionNumber: string, cliente_id: number) => Promise<boolean> = async (
    extensionNumber,
    cliente_id
  ) => {
    try {
      this.logger.log(`Checking if extension ${extensionNumber} already exists in PABX`);
      
      const response = await this.listExtentions({
        numero: extensionNumber,
        cliente_id: cliente_id,
      });

      this.logger.log('response ------------------------------------------------', JSON.stringify(response.data.dados, null, 2));

      if (response.data && response.data.dados) {

        const existingExtension = response.data.dados.find(
          (ramal: any) => ramal.numero === extensionNumber
        );
        
        const exists = !!existingExtension;
        this.logger.log(`Extension ${extensionNumber} exists in PABX: ${exists}`);
        
        return exists;
      }
      
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to check if extension exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };
}
