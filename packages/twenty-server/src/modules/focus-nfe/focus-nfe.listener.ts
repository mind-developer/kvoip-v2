import { Injectable, Logger } from '@nestjs/common';

import { compareDesc } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { IsNull, Not } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import {
  buildNFComPayload,
  buildNFSePayload,
  getCurrentFormattedDate,
} from 'src/modules/focus-nfe/utils/nf-builder';
import { UpdateProperties } from 'src/modules/nota-fiscal/nota-fiscal.listener';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

@Injectable()
export class FocusNFeEventListener {
  private readonly logger = new Logger('FocusNFeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly focusNFeService: FocusNFeService,
    private readonly environmentService: TwentyConfigService,
  ) {}

  @OnDatabaseBatchEvent('notaFiscal', DatabaseEventAction.UPDATED)
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

    const notaFiscalRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<NotaFiscalWorkspaceEntity>(
        workspaceId,
        'notaFiscal',
        { shouldBypassPermissionChecks: true },
      );

    const nfRepository = await Promise.all(
      events.map(async (event) => {
        const notaFiscal = await notaFiscalRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'company', 'focusNFe'],
        });

        const props =
          event.properties as UpdateProperties<NotaFiscalWorkspaceEntity>;

        const previousStatus = props.before.nfStatus;

        return {
          notaFiscal,
          previousStatus,
        };
      }),
    );

    await Promise.all(
      nfRepository.map(async ({ notaFiscal, previousStatus }) => {
        if (!notaFiscal) {
          this.logger.warn(`Invoice not found for recordId: ${notaFiscal}`);

          return;
        }

        const { company, product } = notaFiscal;

        if (!product || !company) {
          notaFiscal.nfStatus = NfStatus.DRAFT;
          await notaFiscalRepository.save(notaFiscal);

          return;
        }

        try {
          switch (notaFiscal.nfStatus) {
            case NfStatus.DRAFT:
            case NfStatus.ISSUED:
            case NfStatus.CANCELLED: {
              if (!notaFiscal.focusNFe?.token || !notaFiscal.nfType) return;

              const statusResult = await this.focusNFeService.getNoteStatus(
                notaFiscal.nfType,
                notaFiscal.id,
                notaFiscal.focusNFe.token,
              );

              if (!statusResult.success || !statusResult.data?.status) {
                this.logger.warn(
                  `Could not get status for invoice ${notaFiscal.id}`,
                );
                break;
              }

              const statusMap: Record<string, NfStatus> = {
                autorizado: NfStatus.ISSUED,
                cancelado: NfStatus.CANCELLED,
                erro_autorizacao: NfStatus.DRAFT,
                permissao_negada: NfStatus.DRAFT,
                processando_autorizacao: NfStatus.IN_PROCESS,
              };

              const newStatus = statusMap[statusResult.data.status];

              if (newStatus) {
                notaFiscal.nfStatus = newStatus;
              } else {
                this.logger.warn(
                  `Unknown NF status '${statusResult.data.status}' for invoice [${notaFiscal.name}] id: ${notaFiscal.id}`,
                );
              }
              break;
            }

            case NfStatus.ISSUE: {
              const issueResult = await this.issueNf(notaFiscal, workspaceId);

              if (issueResult?.success) {
                if (
                  issueResult.data.status == 'erro_autorizacao' ||
                  issueResult.data.status == 'permissao_negada'
                ) {
                  notaFiscal.nfStatus = NfStatus.DRAFT;
                } else {
                  notaFiscal.nfStatus = NfStatus.IN_PROCESS;
                }

                this.logger.log(
                  `Invoice [${notaFiscal.nfType}] issued with id ${issueResult.data.ref}`,
                );
              } else {
                notaFiscal.nfStatus = NfStatus.DRAFT;
                this.logger.error(
                  `Error issuing invoice ${notaFiscal.id}: ${issueResult?.error}`,
                );
              }
              break;
            }

            case NfStatus.CANCEL: {
              if (previousStatus !== NfStatus.ISSUED) return;

              const result = await this.cancelNf(notaFiscal);

              if (result?.success) {
                notaFiscal.nfStatus = NfStatus.CANCELLED;
                this.logger.log(
                  `Invoice [${notaFiscal.nfType}] cancelled with id ${notaFiscal.id}`,
                );
              } else {
                this.logger.error(
                  `Error cancelling invoice ${notaFiscal.id}: ${result?.error}`,
                );
              }

              notaFiscal.nfStatus = NfStatus.CANCELLED;
              break;
            }

            default:
              this.logger.warn(`Unable to issue invoice`);
              break;
          }
        } catch (error) {
          notaFiscal.nfStatus = NfStatus.DRAFT;
          this.logger.error(
            `Error processing invoice ${notaFiscal.id}: ${error.message}`,
            error.stack,
          );
        }

        await notaFiscalRepository.save(notaFiscal);
      }),
    );
  }

  private issueNf = async (
    notaFiscal: NotaFiscalWorkspaceEntity,
    workspaceId: string,
  ) => {
    const { product, company, focusNFe } = notaFiscal;

    if (!product || !company || !focusNFe?.token) return;

    switch (notaFiscal.nfType) {
      case NfType.NFSE: {
        const lastInvoiceIssued = await this.getLastInvoiceIssued(workspaceId);

        if (!lastInvoiceIssued) return;

        const codMunicipioPrestador =
          await this.focusNFeService.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );

        const codMunicipioTomador =
          await this.focusNFeService.getCodigoMunicipio(
            notaFiscal.company?.address.addressCity || '',
            focusNFe?.token,
          );

        const nfse = buildNFSePayload(
          notaFiscal,
          codMunicipioPrestador,
          codMunicipioTomador,
          lastInvoiceIssued?.numeroRps,
        );

        if (!nfse) return;

        const result = await this.focusNFeService.issueNF(
          'nfse',
          nfse,
          notaFiscal.id,
          focusNFe?.token,
        );

        return result;
      }

      case NfType.NFCOM: {
        const codMunicipioEmitente =
          await this.focusNFeService.getCodigoMunicipio(
            focusNFe?.city,
            focusNFe?.token,
          );

        const codMunicipioTomador =
          await this.focusNFeService.getCodigoMunicipio(
            notaFiscal.company?.address.addressCity || '',
            focusNFe?.token,
          );

        const nfcom = buildNFComPayload(
          notaFiscal,
          codMunicipioEmitente,
          codMunicipioTomador,
        );

        if (!nfcom) return;

        const result = await this.focusNFeService.issueNF(
          'nfcom',
          nfcom,
          notaFiscal.id,
          focusNFe?.token,
        );

        return result;
      }
    }
  };

  private cancelNf = async (notaFiscal: NotaFiscalWorkspaceEntity) => {
    const { focusNFe } = notaFiscal;

    if (!focusNFe?.token) return;

    switch (notaFiscal.nfType) {
      case NfType.NFSE: {
        const result = await this.focusNFeService.cancelNote(
          notaFiscal.nfType,
          notaFiscal.id,
          notaFiscal.justificativa,
          focusNFe?.token,
        );

        return result;
      }
      case NfType.NFCOM: {
        const result = await this.focusNFeService.cancelNote(
          notaFiscal.nfType,
          notaFiscal.id,
          notaFiscal.justificativa,
          focusNFe?.token,
        );

        return result;
      }
    }
  };

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
