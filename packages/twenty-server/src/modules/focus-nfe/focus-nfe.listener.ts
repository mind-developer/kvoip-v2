import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FocusNFeService } from 'src/modules/focus-nfe/focus-nfe.service';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import {
  buildNFComPayload,
  buildNFSePayload,
} from 'src/modules/focus-nfe/utils/nf-builder';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

@Injectable()
export class FocusNFeEventListener {
  private readonly logger = new Logger('FocusNFeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly focusNFeService: FocusNFeService,
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
      events.map((event) =>
        notaFiscalRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'company', 'focusNFe'],
        }),
      ),
    );

    await Promise.all(
      nfRepository.map(async (notaFiscal) => {
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
            case NfStatus.CANCELLED:
              break;

            case NfStatus.ISSUE: {
              const issueResult = await this.issueNf(notaFiscal);

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

            case NfStatus.CANCEL:
              break;

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

  private issueNf = async (notaFiscal: NotaFiscalWorkspaceEntity) => {
    const { product, company, focusNFe } = notaFiscal;

    if (!product || !company || !focusNFe?.token) return;

    switch (notaFiscal.nfType) {
      case NfType.NFSE: {
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
        );

        if (!nfse) return;

        console.log('nfse: ', nfse);

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
}
