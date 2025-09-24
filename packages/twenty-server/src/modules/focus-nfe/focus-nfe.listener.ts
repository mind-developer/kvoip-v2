import { Injectable, Logger } from '@nestjs/common';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { UpdateProperties } from 'src/modules/invoice/invoice.listener';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';

@Injectable()
export class FocusNFeEventListener {
  private readonly logger = new Logger('FocusNFeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly focusNFeService: FocusNFeService,
  ) {}

  @OnDatabaseBatchEvent('invoice', DatabaseEventAction.UPDATED)
  async handleChargeUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const { workspaceId, name: eventName, events } = payload;

    this.logger.log('CAIU NO LISTENER DA FOCUS NFE');

    if (!workspaceId || !eventName) {
      this.logger.log(
        `Missing workspaceId or eventName in payload ${JSON.stringify(payload)}`,
      );

      return;
    }

    const invoiceRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<InvoiceWorkspaceEntity>(
        workspaceId,
        'invoice',
        { shouldBypassPermissionChecks: true },
      );

    const nfRepository = await Promise.all(
      events.map(async (event) => {
        const invoice = await invoiceRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'company', 'focusNFe'],
        });

        const props =
          event.properties as UpdateProperties<InvoiceWorkspaceEntity>;

        const previousStatus = props.before.nfStatus;

        return {
          invoice,
          previousStatus,
        };
      }),
    );

    await Promise.all(
      nfRepository.map(async ({ invoice, previousStatus }) => {
        if (!invoice) {
          this.logger.log(`Invoice not found for recordId: ${invoice}`);

          return;
        }

        const { company, product } = invoice;

        if (!product || !company) {
          invoice.nfStatus = NfStatus.DRAFT;
          await invoiceRepository.save(invoice);

          return;
        }

        try {
          switch (invoice.nfStatus) {
            case NfStatus.DRAFT:
            case NfStatus.ISSUED:
            case NfStatus.CANCELLED: {
              if (!invoice.focusNFe?.token || !invoice.nfType) return;

              const statusResult = await this.focusNFeService.getNoteStatus(
                invoice.nfType,
                invoice.id,
                invoice.focusNFe.token,
              );

              if (!statusResult.success || !statusResult.data?.status) {
                this.logger.warn(
                  `Could not get status for invoice ${invoice.id}`,
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
                invoice.nfStatus = newStatus;
              } else {
                this.logger.warn(
                  `Unknown NF status '${statusResult.data.status}' for invoice [${invoice.name}] id: ${invoice.id}`,
                );
              }
              break;
            }

            case NfStatus.ISSUE: {
              const issueResult = await this.focusNFeService.preIssueNf(
                invoice,
                workspaceId,
              );

              if (issueResult?.success) {
                if (
                  issueResult.data.status == 'erro_autorizacao' ||
                  issueResult.data.status == 'permissao_negada'
                ) {
                  invoice.nfStatus = NfStatus.DRAFT;
                } else {
                  invoice.nfStatus = NfStatus.IN_PROCESS;
                }

                this.logger.log(
                  `Invoice [${invoice.nfType}] issued with id ${issueResult.data.ref}`,
                );
              } else {
                invoice.nfStatus = NfStatus.DRAFT;
                this.logger.error(
                  `Error issuing invoice ${invoice.id}: ${issueResult?.error}`,
                );
              }
              break;
            }

            case NfStatus.CANCEL: {
              if (previousStatus !== NfStatus.ISSUED) return;

              const result = await this.cancelNf(invoice);

              if (result?.success) {
                invoice.nfStatus = NfStatus.CANCELLED;
                this.logger.log(
                  `Invoice [${invoice.nfType}] cancelled with id ${invoice.id}`,
                );
              } else {
                this.logger.error(
                  `Error cancelling invoice ${invoice.id}: ${result?.error}`,
                );
              }

              invoice.nfStatus = NfStatus.CANCELLED;
              break;
            }

            default:
              this.logger.warn(`Unable to issue invoice`);
              break;
          }
        } catch (error) {
          invoice.nfStatus = NfStatus.DRAFT;
          this.logger.error(
            `Error processing invoice ${invoice.id}: ${error.message}`,
            error.stack,
          );
        }

        await invoiceRepository.save(invoice);
      }),
    );
  }

  private cancelNf = async (invoice: InvoiceWorkspaceEntity) => {
    const { focusNFe } = invoice;

    if (!focusNFe?.token) return;

    switch (invoice.nfType) {
      case NfType.NFSE: {
        const result = await this.focusNFeService.cancelNote(
          invoice.nfType,
          invoice.id,
          invoice.justification,
          focusNFe?.token,
        );

        return result;
      }
      case NfType.NFCOM: {
        const result = await this.focusNFeService.cancelNote(
          invoice.nfType,
          invoice.id,
          invoice.justification,
          focusNFe?.token,
        );

        return result;
      }
    }
  };
}
