/* eslint-disable no-case-declarations */
import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FocusNFeService } from 'src/modules/charges/focusNFe/FocusNFeService';
import {
  FlattenedCompany,
  FlattenedPerson,
} from 'src/modules/charges/types/inter';
import { NfStatus } from 'src/modules/charges/types/NfStatus';
import { NfType } from 'src/modules/charges/types/NfType';
import { NFSe } from 'src/modules/charges/types/NotaFiscal.type';

import { InterApiService } from './inter/inter-api.service';
import { ChargeWorkspaceEntity } from './standard-objects/charge.workspace-entity';

@Injectable()
export class ChargeEventListener {
  private readonly logger = new Logger('ChargeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
    private readonly focusNFeService: FocusNFeService,
  ) {}

  @OnDatabaseBatchEvent('charge', DatabaseEventAction.UPDATED)
  async handleChargeCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const { workspaceId, name: eventName, events } = payload;

    if (!workspaceId || !eventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(payload)}`,
      );

      return;
    }

    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
      );

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<any>(
        workspaceId,
        'attachment',
      );

    const charges = await Promise.all(
      events.map((event) =>
        chargeRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'person', 'company'],
        }),
      ),
    );

    await Promise.all(
      charges.map(async (charge) => {
        if (!charge) {
          this.logger.warn(`Charge not found for recordId: ${charge}`);

          return;
        }

        const person = charge.person as FlattenedPerson;
        const company = charge.company as FlattenedCompany;

        const { chargeAction, id, price } = charge;
        const dataVencimento = '2025-10-21'; //temporario

        if (!person || !company) {
          this.logger.warn(
            `Charge ${id} não possui relação com person ou company. Ignorando.`,
          );

          charge.chargeAction = 'none';

          return;
        }

        this.logger.log('person', company);

        const cliente = {
          telefone: person.phonesPrimaryPhoneNumber || '',
          cpfCnpj: charge.taxId.replace(/\D/g, ''),
          tipoPessoa:
            charge.entityType === 'individual' ? 'FISICA' : 'JURIDICA',
          nome: person.nameFirstName || '',
          cidade: person.city || '',
          uf: company.addressAddressState || 'SP',
          cep: company.addressAddressPostcode || '18103418',
          ddd: person.phonesPrimaryPhoneCallingCode?.replace(/^\+/, '') || '',
          endereco: company.addressAddressStreet1 || 'Rua ...',
          bairro: company.addressAddressStreet2 || '',
          email: person.emailsPrimaryEmail || '',
          complemento: '-',
          numero: '-',
        };

        const authorId =
          person.createdByWorkspaceMemberId ||
          company.createdByWorkspaceMemberId ||
          '';

        try {
          switch (chargeAction) {
            case 'issue':
              this.logger.log(
                `Emitindo cobrança para charge ${id.slice(0, 11)}`,
              );

              const response =
                await this.interApiService.issueChargeAndStoreAttachment(
                  workspaceId,
                  attachmentRepository,
                  {
                    id: charge.id,
                    authorId,
                    seuNumero: id.slice(0, 8),
                    valorNominal: price,
                    dataVencimento,
                    numDiasAgenda: 60,
                    pagador: { ...cliente },
                    mensagem: { linha1: '-' },
                  },
                );

              charge.requestCode = response.codigoSolicitacao;

              this.logger.log(
                `Cobrança emitida e attachment salvo para charge ${id}. Código: ${response.codigoSolicitacao}`,
              );
              break;

            case 'cancel':
              this.logger.log(`Cancelando cobrança para charge ${id}`);

              await this.interApiService.cancelCharge(
                workspaceId,
                charge.requestCode || id,
                'Cancelamento manual',
              );
              charge.requestCode = '';
              charge.chargeAction = 'cancel';
              this.logger.log(
                `Cobrança cancelada com sucesso para charge ${id}`,
              );
              break;

            case 'none':
              this.logger.log(`Nenhuma ação necessária para charge ${id}`);
              break;

            default:
              this.logger.warn(
                `Ação desconhecida para charge ${id}: ${chargeAction}`,
              );
              break;
          }
        } catch (error) {
          charge.chargeAction = 'none';
          charge.requestCode = '';
          this.logger.error(
            `Erro processando charge ${id}: ${error.message}`,
            error.stack,
          );
        }

        await chargeRepository.save(charge);
      }),
    );
  }

  @OnDatabaseBatchEvent('charge', DatabaseEventAction.UPDATED)
  async handleChargeUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const { workspaceId, name: eventName, events } = payload;

    if (!workspaceId || !eventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(payload)}`,
      );

      return;
    }

    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
      );

    const charges = await Promise.all(
      events.map((event) =>
        chargeRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'person', 'company'],
        }),
      ),
    );

    await Promise.all(
      charges.map(async (charge) => {
        if (!charge) {
          this.logger.warn(`Charge not found for recordId: ${charge}`);

          return;
        }

        const { company, product } = charge;

        if (!product || !company) {
          charge.nfStatus = NfStatus.DRAFT;
          await chargeRepository.save(charge);

          return;
        }

        // TODO: think about how to validate valid fields by NF type
        // if (!this.isNFSeComplete(charge)) {
        //   charge.nfStatus = NfStatus.DRAFT;
        //   await chargeRepository.save(charge);

        //   return;
        // }

        try {
          switch (charge.nfStatus) {
            case NfStatus.DRAFT:
            case NfStatus.ISSUED:
            case NfStatus.CANCELLED:
              break;

            case NfStatus.ISSUE:
              const issueResult = await this.issueNf(charge);

              // ! Remove log after testing

              console.log('issueResult: ', issueResult);

              if (issueResult?.success) {
                charge.nfStatus = NfStatus.ISSUED;

                this.logger.log(
                  `Nota fiscal emitida com sucesso para charge ${charge.id}. Código: ${issueResult.data.ref}`,
                );
              } else {
                charge.nfStatus = NfStatus.DRAFT;
                this.logger.error(
                  `Erro ao emitir nota fiscal para charge ${charge.id}: ${issueResult?.error}`,
                );
              }
              break;

            case NfStatus.CANCEL:
              break;

            default:
              this.logger.warn(
                `Não foi possível em fazer a emissão da nota fiscal`,
              );
              break;
          }
        } catch (error) {
          charge.nfStatus = NfStatus.DRAFT;
          charge.requestCode = '';
          this.logger.error(
            `Erro processando charge ${charge.id}: ${error.message}`,
            error.stack,
          );
        }

        await chargeRepository.save(charge);
      }),
    );
  }

  private issueNf = async (charge: ChargeWorkspaceEntity) => {
    const { product, company } = charge;

    if (!product || !company) return;

    switch (charge.nfType) {
      case NfType.NFSE: {
        const codMunicipioPrestador =
          await this.focusNFeService.getCodigoMunicipio(
            charge.product?.company?.address.addressCity || '',
          );

        const codMunicipioTomador =
          await this.focusNFeService.getCodigoMunicipio(
            charge.company?.address.addressCity || '',
          );

        const nfse: NFSe = {
          data_emissao: new Date().toISOString(),
          prestador: {
            cnpj: product.company?.cpfCnpj || '',
            inscricao_municipal: product.company?.inscricaoMunicipal || '',
            codigo_municipio: codMunicipioPrestador,
          },
          tomador: {
            cnpj: company.cpfCnpj || '',
            razao_social: company.name,
            email: company.emails.primaryEmail,
            endereco: {
              logradouro: company.address.addressStreet1,
              numero: '999', // Campo obrigatório
              bairro: company.address.addressStreet2,
              codigo_municipio: codMunicipioTomador,
              uf: company.address.addressState,
              cep: company.address.addressZipCode,
            },
          },
          servico: {
            aliquota: charge.aliquotaIss,
            discriminacao: charge.discriminacao,
            iss_retido: charge.issRetido,
            item_lista_servico: charge.itemListaServico,
            codigo_tributario_municipio: charge.codigoTributarioMunicipio,
            valor_servicos: (charge.price * (charge.percentNfse ?? 0)) / 100,
          },
        };

        this.logger.log('Emitindo NFSe:', JSON.stringify(nfse, null, 2));

        const result = await this.focusNFeService.issueNFSe(
          nfse,
          charge.requestCode,
        );

        if (result.success) {
          this.logger.log(
            `NFSe emitida com sucesso. Status: ${result.data.status}`,
          );

          return result;
        } else {
          this.logger.error(`Erro ao emitir NFSe: ${result.error}`);

          return result;
        }
      }

      case NfType.NFE:
        return;
    }
  };
}
