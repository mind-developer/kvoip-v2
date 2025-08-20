import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import {
  clearNotaFiscalCompanyFields,
  fillNotaFiscalFromCompany,
} from 'src/modules/nota-fiscal/utils/nota-fiscal-company.helpers';
import {
  clearNotaFiscalProductFields,
  fillNotaFiscalFromProduct,
} from 'src/modules/nota-fiscal/utils/nota-fiscal-product.helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UpdateProperties<T = any> {
  before: Partial<T>;
  after: Partial<T>;
  updatedFields: string[];
  diff?: Partial<Record<keyof T, { before: unknown; after: unknown }>>;
}

@Injectable()
export class NotaFiscalEventListener {
  private readonly logger = new Logger('NotaFiscalEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    await Promise.all(
      events.map(async (event) => {
        const notaFiscal = await notaFiscalRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'company', 'focusNFe'],
        });

        if (!notaFiscal) {
          this.logger.warn(`Invoice not found for recordId: ${event.recordId}`);

          return;
        }

        const props =
          event.properties as UpdateProperties<NotaFiscalWorkspaceEntity>;

        const changedFields = this.getChangedFields<NotaFiscalWorkspaceEntity>(
          props.updatedFields,
          props.before,
          props.after,
        );

        this.logger.log(
          `Invoice ${notaFiscal.id} updated. Changed fields: ${JSON.stringify(changedFields, null, 2)}`,
        );

        if (props.before.companyId !== props.after.companyId) {
          const isCompanyRemoved = props.after.companyId === null;

          if (isCompanyRemoved) {
            clearNotaFiscalCompanyFields(notaFiscal);
          } else {
            if (!notaFiscal.company) return;
            fillNotaFiscalFromCompany(notaFiscal, notaFiscal.company);
          }
        }

        if (props.before.productId !== props.after.productId) {
          const isProductRemoved = props.after.productId === null;

          if (isProductRemoved) {
            clearNotaFiscalProductFields(notaFiscal);
          } else {
            if (!notaFiscal.product) return;
            fillNotaFiscalFromProduct(notaFiscal, notaFiscal.product);
          }
        }

        const hasProduct = !!notaFiscal.product;
        const hasCompany = !!notaFiscal.company;

        if (hasProduct && hasCompany && !notaFiscal.totalAmount) {
          const newAmountStr = this.calculateTotalAmount(notaFiscal);

          if (newAmountStr) {
            const currentAmountStr = notaFiscal.totalAmount ?? null;

            if (currentAmountStr !== newAmountStr) {
              notaFiscal.totalAmount = newAmountStr;
            }
          }
        }

        await notaFiscalRepository.save(notaFiscal);
      }),
    );
  }

  private getChangedFields<T>(
    updatedFields: string[],
    before: Partial<T>,
    after: Partial<T>,
  ): Partial<T> {
    const changed: Partial<T> = {};

    updatedFields.forEach((field) => {
      const key = field as keyof T;
      const beforeVal = before[key];
      const afterVal = after[key];

      const isDifferent =
        typeof beforeVal === 'object' && typeof afterVal === 'object'
          ? JSON.stringify(beforeVal) !== JSON.stringify(afterVal)
          : beforeVal !== afterVal;

      if (isDifferent) {
        changed[key] = afterVal;
      }
    });

    return changed;
  }

  private calculateTotalAmount(
    notaFiscal: NotaFiscalWorkspaceEntity,
  ): string | null {
    const { nfType, product, percentNfse, percentNfcom } = notaFiscal;

    if (!product) return null;

    let percent: number | undefined;

    switch (nfType) {
      case NfType.NFSE:
        percent = percentNfse;
        break;
      case NfType.NFCOM:
        percent = percentNfcom;
        break;
      default:
        return null;
    }

    if (typeof percent !== 'number' || isNaN(percent)) return null;

    const amount = product.salePrice * (percent / 100);

    return String(amount);
  }
}
