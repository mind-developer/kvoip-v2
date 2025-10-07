import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SoapClientService } from 'src/modules/soap-client/soap-client.service';
import {
    ListRegionsResponse,
    Regiao,
} from 'src/modules/telephony/types/regions.type';

@Injectable()
export class WorkspaceTelephonyService {
  private readonly logger = new Logger(WorkspaceTelephonyService.name);

  constructor(
    private readonly pabxService: PabxService,
    private readonly soapClientService: SoapClientService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  /**
   * Configura todo o ambiente de telefonia para um workspace
   * @param workspace - Workspace a ser configurado
   * @param user - Usuário criador do workspace
   * @param workspaceName - Nome do workspace
   * @returns Resultado da configuração
   */
  async setupWorkspaceTelephony(
    workspace: Workspace,
    user: User,
    workspaceName: string,
  ) {
    this.logger.log(
      'Configurando ambiente de telefonia para workspace: ',
      workspace.id,
    );

    try {
      const techPrefix = this.generateTechPrefix();

      // Configurar cliente SOAP
      await this.setupSoapClient(user, techPrefix);

      // Configurar ambiente PABX
      const pabxResult = await this.setupPabxEnvironment(
        workspace,
        user,
        workspaceName,
        techPrefix,
      );

      return {
        success: true,
        message: 'Ambiente de telefonia configurado com sucesso.',
        techPrefix,
        pabxResult,
      };
    } catch (error) {
      this.logger.error('Erro na configuração de telefonia:', error);
      throw error;
    }
  }

  /**
   * Configura o cliente SOAP para o workspace
   * @param user - Usuário do workspace
   * @param techPrefix - Prefixo técnico gerado
   */
  private async setupSoapClient(user: User, techPrefix: string) {
    this.logger.log('Configurando cliente SOAP...');

    const clienteData = {
      nome: user.email,
      login: user.email,
      senha: user.email,
      revenda: 0,
      max_cps: 10,
      max_chamadas_simult: 5,
      prepaid_mode: 1,
      cota_diaria_limite: 100,
      cota_mensal_limite: 1000,
      franquia_minima: 50,
      cobranca_extra_mensal: 0,
      cota_diaria_consumo: 0,
      cota_mensal_consumo: 0,
      tipo_cobranca: 3,
      dia_cobranca: 5,
      bloqueia_prejuizo: 0,
      expira_saldo: 0,
      bloqueia_fixo: 0,
      bloqueia_movel: 0,
      bloqueia_internacional: 0,
    };

    const contaVoipData = {
      numero: techPrefix,
      dominio: 'log.kvoip.com.br',
      senha: this.generateRandomPassword(),
      postpaid: true,
      aviso_saldo_habilita: 1,
      aviso_saldo_valor: 1,
      assinatura_valor: 1,
      assinatura_dia: 1,
      saldo: 0,
    };

    const ipData = {
      ip: '186.209.119.150', // 186.209.119.150 / 192.168.1.88
      pospago: true,
      compartilhado: 1,
      tech_prefix: techPrefix,
      monitora_ping: false,
      tabela_roteamento_id: 22,
      tabela_venda_id: 177,
      notificacao_saldo_habilitado: true,
      notificacao_saldo_valor: 100.5,
      local: 11,
    };

    await this.soapClientService.createCompleteClient(
      clienteData,
      contaVoipData,
      ipData,
      22,
      177,
      11,
    );

    this.logger.log('Cliente SOAP configurado com sucesso');
  }

  /**
   * Configura o ambiente PABX para o workspace
   * @param workspace - Workspace a ser configurado
   * @param user - Usuário do workspace
   * @param workspaceName - Nome do workspace
   * @param techPrefix - Prefixo técnico
   * @returns Resultado da configuração PABX
   */
  private async setupPabxEnvironment(
    workspace: Workspace,
    user: User,
    workspaceName: string,
    techPrefix: string,
  ) {
    this.logger.log(
      'Configurando ambiente PABX para workspace: ',
      workspace.id,
    );

    try {
      // Criar empresa no PABX
      const companyInput = {
        tipo: 1,
        login: user.email,
        senha: user.email,
        nome: workspaceName,
        qtd_ramais_max_pabx: 5,
        qtd_ramais_max_pa: 0,
        salas_conf_num_max: 1,
        workspaceId: workspace.id,
        email_cliente: user.email,
        espaco_disco: 300,
        max_chamadas_simultaneas: 1,
        faixa_min: 1000,
        faixa_max: 3000,
        prefixo: this.generateRandomCompanyPrefixBasedOnEmail(user.email),
        habilita_prefixo_sainte: 0,
        acao_limite_espaco: 2,
      };

      const companyResult = await this.pabxService.createCompany(companyInput);
      const companyId = companyResult.data.id;

      if (!companyId) {
        throw new Error('Falha ao criar empresa PABX ou recuperar ID.');
      }

      // Obter regiões e configurar tarifas
      const regionsResponse = await this.pabxService.listRegions(0);
      const regioes: Regiao[] = (regionsResponse.data as ListRegionsResponse)
        .dados;

      const tarifas = regioes.map((regiao: Regiao) => ({
        regiao_id: Number(regiao.regiao_id),
        tarifa: 0,
        fracionamento: '4/30/6',
      }));

      // Criar tronco
      const trunkInput = {
        cliente_id: companyId,
        tronco_id: 0,
        nome: 'Tronco Padrao',
        endereco: 'log.kvoip.com.br',
        qtd_digitos_cortados: 0,
        insere_digitos: techPrefix,
        autentica_user_pass: 0,
        host_dinamico: 0,
        tarifas,
      };

      const trunkResult = await this.pabxService.createTrunk(trunkInput);
      const trunkAPIId = trunkResult.data.id;

      if (!trunkAPIId) {
        throw new Error('Falha ao criar tronco PABX ou recuperar ID.');
      }

      // Obter plano de discagem
      const dialingPlansResponse = await this.pabxService.listDialingPlans({
        cliente_id: companyId,
      });

      const dialingPlan = dialingPlansResponse.data.dados[0];

      if (!dialingPlan) {
        throw new Error('Falha ao obter plano de discagem PABX.');
      }

      const dialingPlanId = dialingPlan.plano_discagem_id;

      // Atualizar workspace com IDs do PABX
      await this.workspaceRepository.update(workspace.id, {
        id: workspace.id,
        pabxCompanyId: companyId,
        pabxTrunkId: trunkAPIId,
        pabxDialingPlanId: dialingPlanId,
      });

      // Configurar regras de roteamento
      const routingRulesData = {
        regioes: regioes.map((regiao: Regiao, index: number) => ({
          regiao_id: Number(regiao.regiao_id),
          regiao_nome: regiao.nome,
          roteamentos: [
            {
              prioridade: index + 1,
              tronco_id: trunkAPIId,
              tronco_nome: trunkResult.data.nome,
            },
          ],
        })),
      };

      const routingRulesInput = {
        plano_discagem_id: dialingPlanId,
        cliente_id: companyId,
        dados: routingRulesData,
      };

      await this.pabxService.updateRoutingRules(routingRulesInput);

      this.logger.log('Ambiente PABX configurado com sucesso.');

      return {
        success: true,
        message: 'Ambiente PABX configurado com sucesso.',
        companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanId,
      };
    } catch (error) {
      this.logger.error(
        `Falha ao configurar ambiente PABX: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Falha ao configurar ambiente PABX: ${error.message}`,
        companyId: undefined,
        trunkId: undefined,
        dialingPlanId: undefined,
      };
    }
  }

  /**
   * Gera uma senha aleatória de 8 dígitos
   * @returns Senha gerada
   */
  private generateRandomPassword(): string {
    return Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(8, '0');
  }

  /**
   * Gera um prefixo técnico aleatório de 7 dígitos
   * @returns Prefixo técnico gerado
   */
  private generateTechPrefix(): string {
    return Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, '0');
  }

  /**
   * Gera um prefixo de empresa baseado no email do usuário
   * @param email - Email do usuário
   * @returns Prefixo da empresa gerado
   */
  private generateRandomCompanyPrefixBasedOnEmail(email: string): string {
    const formatedEmail = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    let randomCompanyPrefix = '';
    const letters = formatedEmail.replace(/[^a-zA-Z]/g, '');

    if (letters.length > 0) {
      const randomLetterIndex = Math.floor(Math.random() * letters.length);
      randomCompanyPrefix = letters[randomLetterIndex];
    } else {
      randomCompanyPrefix = 'A';
    }

    for (let i = 1; i < 7; i++) {
      if (letters.length > 0) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomCompanyPrefix += letters[randomIndex];
      } else {
        randomCompanyPrefix += 'A';
      }
    }

    return randomCompanyPrefix;
  }
}
