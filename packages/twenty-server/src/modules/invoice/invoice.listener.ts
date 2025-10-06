import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import {
  clearInvoiceCompanyFields,
  fillInvoiceFromCompany,
} from 'src/modules/invoice/utils/invoice-company.helpers';
import {
  clearInvoiceProductFields,
  fillInvoiceFromProduct,
} from 'src/modules/invoice/utils/invoice-product.helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UpdateProperties<T = any> {
  before: Partial<T>;
  after: Partial<T>;
  updatedFields: string[];
  diff?: Partial<Record<keyof T, { before: unknown; after: unknown }>>;
}

@Injectable()
export class InvoiceEventListener {
  private readonly logger = new Logger('InvoiceEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @OnDatabaseBatchEvent('invoice', DatabaseEventAction.UPDATED)
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

    const invoiceRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<InvoiceWorkspaceEntity>(
        workspaceId,
        'invoice',
        { shouldBypassPermissionChecks: true },
      );

    await Promise.all(
      events.map(async (event) => {
        const invoice = await invoiceRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'product.company', 'company', 'focusNFe'],
        });

        if (!invoice) {
          this.logger.warn(`Invoice not found for recordId: ${event.recordId}`);

          return;
        }

        const props =
          event.properties as UpdateProperties<InvoiceWorkspaceEntity>;

        const changedFields = this.getChangedFields<InvoiceWorkspaceEntity>(
          props.updatedFields,
          props.before,
          props.after,
        );

        this.logger.log(
          `Invoice ${invoice.id} updated. Changed fields: ${JSON.stringify(changedFields, null, 2)}`,
        );

        if (props.before.companyId !== props.after.companyId) {
          const isCompanyRemoved = props.after.companyId === null;

          if (isCompanyRemoved) {
            clearInvoiceCompanyFields(invoice);
          } else {
            if (!invoice.company) return;
            fillInvoiceFromCompany(invoice, invoice.company);
          }
        }

        if (props.before.productId !== props.after.productId) {
          const isProductRemoved = props.after.productId === null;

          if (isProductRemoved) {
            clearInvoiceProductFields(invoice);
          } else {
            if (!invoice.product) return;
            fillInvoiceFromProduct(invoice, invoice.product);
          }
        }

        const hasProduct = !!invoice.product;
        const hasCompany = !!invoice.company;

        if (hasProduct && hasCompany && !invoice.totalAmount) {
          const newAmountStr = this.calculateTotalAmount(invoice);

          if (newAmountStr) {
            const currentAmountStr = invoice.totalAmount ?? null;

            if (currentAmountStr !== newAmountStr) {
              invoice.totalAmount = newAmountStr;
            }
          }
        }

        await invoiceRepository.save(invoice);
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
    invoice: InvoiceWorkspaceEntity,
  ): string | null {
    const { nfType, product, percentNfse, percentNfcom } = invoice;

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
