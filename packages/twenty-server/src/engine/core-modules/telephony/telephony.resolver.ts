/* @kvoip-woulz proprietary */
import { Logger, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TelephonyService } from 'src/engine/core-modules/telephony/services/telephony.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceTelephonyService } from 'src/engine/core-modules/workspace/services/workspace-telephony.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateDialingPlanInput } from 'src/modules/telephony/dtos/create-dialing-plan.input';
import { CreatePabxCompanyInput } from 'src/modules/telephony/dtos/create-pabx-company.input';
import { CreatePabxTrunkInput } from 'src/modules/telephony/dtos/create-pabx-trunk.input';
import { CreateTelephonyInput } from 'src/modules/telephony/dtos/create-telephony.input';
import { SetupPabxEnvironmentInput } from 'src/modules/telephony/dtos/setup-pabx-environment.input';
import { UpdateRoutingRulesInput } from 'src/modules/telephony/dtos/update-routing-rules.input';
import { UpdateTelephonyInput } from 'src/modules/telephony/dtos/update-telephony.input';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';
import { Campaign } from 'src/modules/telephony/types/Campaign.type';
import { PabxCompanyResponseType } from 'src/modules/telephony/types/Create/PabxCompanyResponse.type';
import { PabxDialingPlanResponseType } from 'src/modules/telephony/types/Create/PabxDialingPlanResponse.type';
import { PabxTrunkResponseType } from 'src/modules/telephony/types/Create/PabxTrunkResponse.type';
import { UpdateRoutingRulesResponseType } from 'src/modules/telephony/types/Create/UpdateRoutingRulesResponse.type';
import { SetupPabxEnvironmentResponseType } from 'src/modules/telephony/types/SetupPabxEnvironmentResponse.type';
import { TelephonyData } from 'src/modules/telephony/types/Telephony.type';
import { TelephonyCallFlow } from 'src/modules/telephony/types/TelephonyCallFlow';
import { TelephonyDialingPlan } from 'src/modules/telephony/types/TelephonyDialingPlan.type';
import { TelephonyDids } from 'src/modules/telephony/types/TelephonyDids.type';
import { TelephonyExtension } from 'src/modules/telephony/types/TelephonyExtension.type';

@Resolver(() => TelephonyWorkspaceEntity)
export class TelephonyResolver {
  private readonly logger = new Logger(TelephonyResolver.name);
  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly pabxService: PabxService,
    private readonly workspaceService: WorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceTelephonyService: WorkspaceTelephonyService,
  ) {}

  async getRamalBody(
    input: CreateTelephonyInput | UpdateTelephonyInput,
    workspaceId: string,
  ) {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    return {
      dados: {
        tipo: input.type ? parseInt(input.type) : 1,
        nome: input.extensionName,
        numero: input.numberExtension,
        senha_sip: input.SIPPassword,
        caller_id_externo: input.callerExternalID,
        cliente_id: workspace.pabxCompanyId,
        grupo_ramais: '1',
        centro_custo: '1',
        dupla_autenticacao_ip_permitido: '1',
        dupla_autenticacao_mascara: '1',
        grupo_musica_espera: '1',
        plano_discagem_id: input.dialingPlan ? parseInt(input.dialingPlan) : 1,
        puxar_chamadas: input.pullCalls ? parseInt(input.pullCalls) : 0,
        habilitar_timers: 0,
        habilitar_blf: 0,
        escutar_chamadas: input.listenToCalls ? 1 : 0,
        gravar_chamadas: input.recordCalls ? 1 : 0,
        bloquear_ramal: input.blockExtension ? 1 : 0,
        codigo_area: input.areaCode ? parseInt(input.areaCode) : 0,
        habilitar_dupla_autenticacao: 0,
        habilitar_caixa_postal: input.enableMailbox ? 1 : 0,
        caixa_postal_email: input.emailForMailbox
          ? input.emailForMailbox
          : 'default@default.com',
        encaminhar_todas_chamadas: {
          encaminhamento_tipo: input.fowardAllCalls
            ? parseInt(input.fowardAllCalls)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardAllCalls || '0',
            input,
            true,
          ),
          encaminhamento_destinos: [
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding1 || '0'),
              encaminhamento_destino: input.advancedFowarding1Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding2 || '0'),
              encaminhamento_destino: input.advancedFowarding2Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding3 || '0'),
              encaminhamento_destino: input.advancedFowarding3Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding4 || '0'),
              encaminhamento_destino: input.advancedFowarding4Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding5 || '0'),
              encaminhamento_destino: input.advancedFowarding5Value || '',
            },
          ],
        },
        encaminhar_offline_sem_atendimento: {
          encaminhamento_tipo: input.fowardOfflineWithoutService
            ? parseInt(input.fowardOfflineWithoutService)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardOfflineWithoutService || '0',
            input,
            true,
          ),
        },
        encaminhar_ocupado_indisponivel: {
          encaminhamento_tipo: input.fowardBusyNotAvailable
            ? parseInt(input.fowardBusyNotAvailable)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardBusyNotAvailable || '0',
            input,
            false,
          ),
        },
      },
    };
  }

  switchFowardOptions(
    foward: string,
    options: CreateTelephonyInput | UpdateTelephonyInput,
    allCallsOrOffline: boolean,
  ) {
    switch (foward) {
      case '1':
        return allCallsOrOffline
          ? options.extensionAllCallsOrOffline
          : options.extensionBusy;
      case '8':
        return allCallsOrOffline
          ? options.externalNumberAllCallsOrOffline
          : options.externalNumberBusy;
      case '9':
        return allCallsOrOffline
          ? options.destinyMailboxAllCallsOrOffline
          : options.destinyMailboxBusy;
      default:
        return '';
    }
  }

  @Mutation(() => TelephonyWorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async createTelephonyIntegration(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('createTelephonyInput') createTelephonyInput: CreateTelephonyInput,
  ): Promise<TelephonyWorkspaceEntity | undefined> {

    if (!userId) {
      throw new Error('User id not found');
    }

    if (!workspace.id) {
      throw new Error('Workspace id not found');
    }

    if (!workspace.pabxCompanyId) {
      // TODO: adicionar chamada para criação de empresa
      throw new Error('PABX company not found');
    }

    // Validação 1: Verificar se o membro já possui um ramal na tabela telephony
    const memberHasTelephony = await this.telephonyService.checkMemberHasTelephony(
      createTelephonyInput.memberId,
      workspace.id,
    );

    if (memberHasTelephony) {
      throw new Error('Este membro já possui um ramal de telefonia. Não é possível criar duplicatas.');
    }

    const ramalBody = await this.getRamalBody(
      createTelephonyInput,
      workspace.id,
    );

    // Validação 2: Verificar se o número da extensão já existe na API PABX
    const extensionExists = await this.pabxService.checkExtensionExists(
      createTelephonyInput.numberExtension,
      Number(workspace.pabxCompanyId),
    );

    if (extensionExists) {
      throw new Error(`O número de extensão ${createTelephonyInput.numberExtension} já está em uso no sistema PABX.`);
    }

    try {
      const createdRamal = await this.pabxService.createExtention(ramalBody);

      if (createdRamal) {
        const result = await this.telephonyService.createTelephony(
          {
            ...createTelephonyInput,
            ramal_id: createdRamal.data.id,
          },
          workspace.id,
        );

        return result;
      }
    } catch (error) {
      return error;
    }
  }

  @Query(() => [TelephonyData])
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async findAllTelephonyIntegration(
    @AuthUser() user: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyData[]> {


    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {

      // If the workspace does not have a PABX company, setup the PABX environment
      if (this.twentyConfigService.get('NODE_ENV') === 'production') {
        this.logger.log('Iniciando configuração de telefonia para workspace: ', workspace.id);
  
        try {
          await this.workspaceTelephonyService.setupWorkspaceTelephony(
            workspace,
            user,
            workspace.displayName!,
          );
  
          this.logger.log('Configuração de telefonia concluída com sucesso');
        } catch (error) {
  
          // TODO: implementar classe de exceção para telefonia
  
          this.logger.error('Erro na configuração de telefonia:', error);
          throw error;
        }
      } else {
        throw new Error('Companhia PABX não encontrada');
      }
    }

    const result = await this.telephonyService.findAll({ workspaceId });
    
    // TODO: Por algum motivo passar a entidade da erro na relação do member, necessario rever e alterar esse mapemaento
    const mappedResult: TelephonyData[] = result.map((telephony: TelephonyWorkspaceEntity) => {
      const parsedTelephony: TelephonyData = {
        id: telephony.id,
        memberId: telephony.memberId,
        numberExtension: telephony.numberExtension,
        extensionName: telephony.extensionName || null,
        extensionGroup: telephony.extensionGroup || null,
        type: telephony.type || null,
        dialingPlan: telephony.dialingPlan || null,
        areaCode: telephony.areaCode || null,
        SIPPassword: telephony.SIPPassword || null,
        callerExternalID: telephony.callerExternalID || null,
        pullCalls: telephony.pullCalls || null,
        listenToCalls: telephony.listenToCalls || null,
        recordCalls: telephony.recordCalls || null,
        blockExtension: telephony.blockExtension || null,
        enableMailbox: telephony.enableMailbox || null,
        emailForMailbox: telephony.emailForMailbox || null,
        fowardAllCalls: telephony.fowardAllCalls || null,
        fowardBusyNotAvailable: telephony.fowardBusyNotAvailable || null,
        fowardOfflineWithoutService: telephony.fowardOfflineWithoutService || null,
        extensionAllCallsOrOffline: telephony.extensionAllCallsOrOffline || null,
        externalNumberAllCallsOrOffline: telephony.externalNumberAllCallsOrOffline || null,
        destinyMailboxAllCallsOrOffline: telephony.destinyMailboxAllCallsOrOffline || null,
        extensionBusy: telephony.extensionBusy || null,
        externalNumberBusy: telephony.externalNumberBusy || null,
        destinyMailboxBusy: telephony.destinyMailboxBusy || null,
        ramal_id: telephony.ramal_id || null,
        advancedFowarding1: telephony.advancedFowarding1 || null,
        advancedFowarding2: telephony.advancedFowarding2 || null,
        advancedFowarding3: telephony.advancedFowarding3 || null,
        advancedFowarding4: telephony.advancedFowarding4 || null,
        advancedFowarding5: telephony.advancedFowarding5 || null,
        advancedFowarding1Value: telephony.advancedFowarding1Value || null,
        advancedFowarding2Value: telephony.advancedFowarding2Value || null,
        advancedFowarding3Value: telephony.advancedFowarding3Value || null,
        advancedFowarding4Value: telephony.advancedFowarding4Value || null,
        advancedFowarding5Value: telephony.advancedFowarding5Value || null,
        createdAt: telephony.createdAt || undefined,
        updatedAt: telephony.updatedAt || undefined,
        member: telephony.member ? {
          id: telephony.member.id,
          name: telephony.member.name ? {
            firstName: telephony.member.name.firstName || null,
            lastName: telephony.member.name.lastName || null,
          } : null,
          userEmail: telephony.member.userEmail || null,
          avatarUrl: telephony.member.avatarUrl || null,
          userId: telephony.member.userId || null,
          timeZone: telephony.member.timeZone || null,
          dateFormat: telephony.member.dateFormat || null,
          timeFormat: telephony.member.timeFormat || null,
          calendarStartDay: telephony.member.calendarStartDay?.toString() || null,
        } : null,
      };
      
      return parsedTelephony;
    });

    return mappedResult;
  }



  @Query(() => [TelephonyExtension])
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async findAllExternalExtensions(
    @AuthUser() { id: userId }: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyExtension[]> {
    if (!userId) {
      throw new Error('User id not found');
    }

    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('Companhia PABX não encontrada');
    }

    const extensions = await this.pabxService.listExtentions({
      cliente_id: Number(workspace.pabxCompanyId),
    });

    return extensions.data.dados;
  }

  @Mutation(() => TelephonyWorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async updateTelephonyIntegration(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('id', { type: () => ID }) id: string,
    @Args('updateTelephonyInput') updateTelephonyInput: UpdateTelephonyInput,
  ): Promise<TelephonyWorkspaceEntity> {
    if (!userId) {
      throw new Error('User id not found');
    }

    const telephony = await this.telephonyService.findOne({
      id,
      workspaceId: workspace.id,
    });

    if (!telephony) {
      throw new Error('Telephony not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    // Validação 2: Se o número da extensão está sendo alterado, verificar se já existe na API PABX
    if (updateTelephonyInput.numberExtension && updateTelephonyInput.numberExtension !== telephony.numberExtension) {
      const extensionExists = await this.pabxService.checkExtensionExists(
        updateTelephonyInput.numberExtension,
        Number(workspace.pabxCompanyId),
      );

      if (extensionExists) {
        throw new Error(`O número de extensão ${updateTelephonyInput.numberExtension} já está em uso no sistema PABX.`);
      }
    }

    // Validação 1: Se o memberId está sendo alterado, verificar se o novo membro já possui um ramal
    if (updateTelephonyInput.memberId && updateTelephonyInput.memberId !== telephony.memberId) {
      const memberHasTelephony = await this.telephonyService.checkMemberHasTelephony(
        updateTelephonyInput.memberId,
        workspace.id,
        id,
      );

      if (memberHasTelephony) {
        throw new Error('O novo membro já possui um ramal de telefonia. Não é possível atribuir duplicatas.');
      }
    }

    try {
      const ramalBody = {
        dados: {
          ...(await this.getRamalBody(updateTelephonyInput, workspace.id))
            .dados,
          ramal_id: telephony.ramal_id,
        },
      };
      
      const updatedRamal = await this.pabxService.updateExtention(ramalBody);

      if (!updatedRamal) {
        throw new Error('Error updating ramal');
      }

      const result = await this.telephonyService.updateTelephony({
        id,
        workspaceId: workspace.id,
        data: {
          ...updateTelephonyInput,
          ramal_id: telephony.ramal_id ?? undefined,
        },
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  @Query(() => [TelephonyExtension], { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getAllExtensions(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyExtension[]> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const extensions = await this.pabxService.listExtentions({
      cliente_id: Number(workspace.pabxCompanyId),
    });
    this.logger.log('extensions ------------------------------------------------', JSON.stringify(extensions.data.dados, null, 2));

    return extensions.data.dados;
  }

  @Query(() => TelephonyExtension, { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getUserSoftfone(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('extNum', { type: () => String, nullable: true }) extNum?: string,
  ): Promise<TelephonyExtension | null> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!extNum) {
      return null;
    }

    const extensions = await this.pabxService.listExtentions({
      numero: extNum,
      cliente_id: Number(workspace.pabxCompanyId),
    });

    return extensions.data.dados[0];
  }

  @Query(() => TelephonyWorkspaceEntity, { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getTelephonyByMember(
    @AuthUser() { id: userId }: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<TelephonyWorkspaceEntity | null> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!workspaceId) {
      throw new Error('Workspace id not found');
    }

    if (!memberId) {
      throw new Error('Member id not found');
    }

    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    try {
      const telephony = await this.telephonyService.getTelephonyByMember({
        memberId,
        workspaceId,
      });

      return telephony;
    } catch (error) {
      this.logger.error('Error getting telephony by member:', error);
      throw new Error(`Failed to get telephony for member: ${error.message}`);
    }
  }

  @Query(() => TelephonyExtension, { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getExternalExtension(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('extNum', { type: () => String, nullable: true }) extNum?: string,
  ): Promise<TelephonyExtension | null> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!extNum) {
      return null;
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const extensions = await this.pabxService.listExtentions({
      numero: extNum,
      cliente_id: Number(workspace.pabxCompanyId),
    });

    this.logger.log('extensions2 ------------------------------------------------', JSON.stringify(extensions.data.dados, null, 2));

    if (!extensions?.data?.dados || extensions.data.dados.length === 0) {
      this.logger.log('No extensions found or empty array');
      return null;
    }

    const extension = extensions.data.dados[0];
    this.logger.log('Returning extension:', JSON.stringify(extension, null, 2));
    this.logger.log('Extension type:', typeof extension);
    this.logger.log('Extension keys:', Object.keys(extension || {}));
    
    // Mapear explicitamente os dados da API para o tipo GraphQL
    const mappedExtension = {
      ramal_id: extension.ramal_id,
      cliente_id: extension.cliente_id,
      nome: extension.nome,
      tipo: extension.tipo,
      usuario_autenticacao: extension.usuario_autenticacao,
      numero: extension.numero,
      senha_sip: extension.senha_sip,
      senha_web: extension.senha_web,
      caller_id_externo: extension.caller_id_externo,
      grupo_ramais: extension.grupo_ramais,
      centro_custo: extension.centro_custo,
      plano_discagem_id: extension.plano_discagem_id,
      grupo_musica_espera: extension.grupo_musica_espera,
      puxar_chamadas: extension.puxar_chamadas,
      habilitar_timers: extension.habilitar_timers,
      habilitar_blf: extension.habilitar_blf,
      escutar_chamadas: extension.escutar_chamadas,
      gravar_chamadas: extension.gravar_chamadas,
      bloquear_ramal: extension.bloquear_ramal,
      codigo_incorporacao: extension.codigo_incorporacao,
      codigo_area: extension.codigo_area,
      habilitar_dupla_autenticacao: extension.habilitar_dupla_autenticacao,
      dupla_autenticacao_ip_permitido: extension.dupla_autenticacao_ip_permitido,
      dupla_autenticacao_mascara: extension.dupla_autenticacao_mascara,
      encaminhar_todas_chamadas: extension.encaminhar_todas_chamadas,
      encaminhar_offline_sem_atendimento: extension.encaminhar_offline_sem_atendimento,
      encaminhar_ocupado_indisponivel: extension.encaminhar_ocupado_indisponivel,
    };
    
    this.logger.log('Mapped extension:', JSON.stringify(mappedExtension, null, 2));
    
    return mappedExtension;
  }

  @Query(() => [TelephonyDialingPlan], { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getTelephonyPlans(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyDialingPlan[]> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const extensions = await this.pabxService.listDialingPlans({
      cliente_id: Number(workspace.pabxCompanyId),
    });

    return extensions.data.dados;
  }

  @Query(() => [TelephonyDids], { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getTelephonyDids(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyDids[]> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const extensions = await this.pabxService.listDids({
      cliente_id: Number(workspace.pabxCompanyId),
    });

    return extensions.data.dados;
  }

  @Query(() => [Campaign], { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getTelephonyURAs(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<Campaign[]> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const uras = await this.pabxService.listCampaigns({
      cliente_id: Number(workspace.pabxCompanyId),
    });

    const data = uras.data.dados.map((ura: Campaign) => {
      const { campanha_id, cliente_id, nome } = ura;

      return { campanha_id, cliente_id, nome };
    });

    return data;
  }

  @Query(() => [TelephonyCallFlow], { nullable: true })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async getTelephonyCallFlows(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<TelephonyCallFlow[]> {
    const workspace = await this.workspaceService.findById(workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.pabxCompanyId) {
      throw new Error('PABX company not found');
    }

    const callFlows = await this.pabxService.listIntegrationFlows({
      cliente_id: Number(workspace.pabxCompanyId),
    });

    const data = callFlows.data.dados.map((ura: TelephonyCallFlow) => {
      const { fluxo_chamada_id, fluxo_chamada_nome } = ura;

      return { fluxo_chamada_id, fluxo_chamada_nome };
    });

    return data;
  }

  @Mutation(() => Boolean)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async deleteTelephonyIntegration(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!id) {
      throw new Error('Agent id not found');
    }

    const telephonyToDelete = await this.telephonyService.findOne({
      id: id,
      workspaceId: workspace.id,
    });

    if (!telephonyToDelete) {
      throw new Error('Telephony not found');
    }

    const result = await this.telephonyService.delete({
      id: id,
      workspaceId: workspace.id,
    });

    return result;
  }

  @Mutation(() => PabxCompanyResponseType, { name: 'createPabxCompany' })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async createPabxCompany(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreatePabxCompanyInput,
  ): Promise<PabxCompanyResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createCompany(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxCompanyId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Company created successfully: ${input.nome}, id: ${result.data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create company: ${error.message}`,
      };
    }
  }

  @Mutation(() => PabxTrunkResponseType, { name: 'createPabxTrunk' })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async createPabxTrunk(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreatePabxTrunkInput,
  ): Promise<PabxTrunkResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createTrunk(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxTrunkId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Trunk created successfully: ${input.nome}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create trunk: ${error.message}`,
      };
    }
  }

  @Mutation(() => PabxDialingPlanResponseType, { name: 'createDialingPlan' })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async createDialingPlan(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreateDialingPlanInput,
  ): Promise<PabxDialingPlanResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createDialingPlan(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxDialingPlanId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Dialing plan created successfully: ${input.nome}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create dialing plan: ${error.message}`,
      };
    }
  }

  @Mutation(() => UpdateRoutingRulesResponseType, {
    name: 'updateRoutingRules',
  })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async updateRoutingRules(
    @AuthUser() { id: userId }: User,
    @Args('input') input: UpdateRoutingRulesInput,
  ): Promise<UpdateRoutingRulesResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    try {
      await this.pabxService.updateRoutingRules(input);

      return {
        success: true,
        message: `Routing rules updated successfully for dialing plan ID: ${input.plano_discagem_id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update routing rules: ${error.message}`,
      };
    }
  }

  @Mutation(() => TelephonyWorkspaceEntity, { name: 'linkMemberToExtension' })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async linkMemberToExtension(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() workspace: Workspace,
    @Args('numberExtension', { type: () => String }) numberExtension: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<TelephonyWorkspaceEntity> {
    if (!userId) {
      throw new Error('Usuário não encontrado');
    }

    if (!workspace.id || !workspace.pabxCompanyId) {
      throw new Error('Workspace não encontrado ou PABX não configurado');
    }
    
    const extension = await this.pabxService.listExtentions({
      numero: numberExtension,
      cliente_id: Number(workspace.pabxCompanyId),
    });

    if (!extension?.data?.dados) {
      throw new Error('Ramal não encontrado');
    }

    const extensionData = Array.isArray(extension.data.dados) ? extension.data.dados[0] : extension.data.dados;

    const telephonyByMember = await this.telephonyService.getTelephonyByMember({
      memberId: memberId,
      workspaceId: workspace.id
    });

    const telephonyByNumber = await this.telephonyService.getTelephonyByNumber({
      numberExtension: extensionData.numero,
      workspaceId: workspace.id
    });

    if (telephonyByMember) {

      if (telephonyByNumber) {
        // Situação onde o usuario não esta efetuando modificações em um ramal que ele ja possui
        if (telephonyByMember.id == telephonyByNumber.id) {
          return telephonyByMember;
        }
      }

      // Deleta o registro antigo do member, para alocar o novo ramal
      await this.telephonyService.delete({
        id: telephonyByMember.id,
        workspaceId: workspace.id
      });
    }
    
    if (telephonyByNumber) {
      // Atualiza o member no telefone existente
      await this.telephonyService.updateTelephony({
        id: telephonyByNumber.id,
        workspaceId: workspace.id,
        data: {
          memberId: memberId,
        }
      });

      return telephonyByNumber;

    } else {
      // Criar registro na tabela telephony
      const telephonyData = {
        memberId,
        ramal_id: extensionData.numero,
        extensionName: extensionData.nome,
        numberExtension: extensionData.numero,
        type: extensionData.tipo,
        SIPPassword: extensionData.senha_sip,
        callerExternalID: extensionData.caller_id_externo,
        dialingPlan: extensionData.plano_discagem_id,
        areaCode: extensionData.codigo_area,
        pullCalls: extensionData.puxar_chamadas,
        listenToCalls: extensionData.escutar_chamadas === '1',
        recordCalls: extensionData.gravar_chamadas === '1',
        blockExtension: extensionData.bloquear_ramal === '1',
        enableMailbox: false,
        emailForMailbox: '',
        fowardAllCalls: extensionData.encaminhar_todas_chamadas?.encaminhamento_tipo?.toString() || '0',
        fowardOfflineWithoutService: extensionData.encaminhar_offline_sem_atendimento?.encaminhamento_tipo?.toString() || '0',
        fowardBusyNotAvailable: extensionData.encaminhar_ocupado_indisponivel?.encaminhamento_tipo?.toString() || '0',
      };

      const result = await this.telephonyService.createTelephony(
        telephonyData,
        workspace.id,
      );

      return (result);
    }
  }

  @Mutation(() => SetupPabxEnvironmentResponseType, {
    name: 'setupPabxEnvironment',
  })
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async setupPabxEnvironment(
    @AuthUser() { id: userId }: User,
    @Args('input') input: SetupPabxEnvironmentInput,
  ): Promise<SetupPabxEnvironmentResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace ID is required in input');
    }

    let companyId: number | undefined;
    let trunkAPIId: number | undefined;
    let dialingPlanAPIId: number | undefined;

    try {
      const companyInput: CreatePabxCompanyInput = {
        ...input.companyDetails,
        workspaceId: input.workspaceId,
      };

      const companyResult = await this.pabxService.createCompany(companyInput);

      companyId = companyResult.data.id;

      if (!companyResult || !companyResult.data || !companyId) {
        throw new Error('Failed to create PABX company or retrieve ID.');
      }

      const trunkInput: CreatePabxTrunkInput = {
        ...input.trunkDetails,
        cliente_id: companyId,
        workspaceId: input.workspaceId,
      };

      const trunkResult = await this.pabxService.createTrunk(trunkInput);

      trunkAPIId = trunkResult.data.id;

      if (!trunkResult || !trunkResult.data || !trunkAPIId) {
        throw new Error('Failed to create PABX trunk or retrieve ID.');
      }

      // Step 3: Create Dialing Plan
      const dialingPlanInput: CreateDialingPlanInput = {
        ...input.dialingPlanDetails,
        cliente_id: companyId,
        workspaceId: input.workspaceId,
      };

      const dialingPlanResult =
        await this.pabxService.createDialingPlan(dialingPlanInput);

      dialingPlanAPIId = dialingPlanResult.data.id;

      if (!dialingPlanResult || !dialingPlanResult.data || !dialingPlanAPIId) {
        throw new Error('Failed to create PABX dialing plan or retrieve ID.');
      }

      await this.workspaceService.updateWorkspaceById({
        payload: {
          id: input.workspaceId,
          pabxCompanyId: companyId.toString(),
          pabxTrunkId: trunkAPIId.toString(),
          pabxDialingPlanId: dialingPlanAPIId.toString(),
          // softSwitchClientId: soapClientId.toString(),
        },
      });

      // Inject trunkAPIId into all routing rules
      const routingRulesDataWithTrunkId = {
        ...input.routingRulesData,
        regioes: input.routingRulesData.regioes.map((region) => ({
          ...region,
          roteamentos: region.roteamentos.map((rule) => ({
            ...rule,
            tronco_id: trunkAPIId,
          })),
        })),
      };

      const routingRulesInput: UpdateRoutingRulesInput = {
        plano_discagem_id: dialingPlanAPIId,
        cliente_id: companyId,
        dados: routingRulesDataWithTrunkId,
      };

      await this.pabxService.updateRoutingRules(routingRulesInput);

      return {
        success: true,
        message: 'PABX environment set up successfully.',
        companyId: companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanAPIId,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up PABX environment: ${error.message}`,
        companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanAPIId,
      };
    }
  }
}
