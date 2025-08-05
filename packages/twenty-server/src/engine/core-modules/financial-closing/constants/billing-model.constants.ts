import { TagColor } from "src/engine/metadata-modules/field-metadata/dtos/options.input";

export enum BillingModelEnum {
  PREPAID = 'PREPAID',
  POSTPAID = 'POSTPAID',
  PREPAID_UNLIMITED = 'PREPAID_UNLIMITED',
  POSTPAID_UNLIMITED = 'POSTPAID_UNLIMITED',
}

type BillingModelMetadata = {
  label: string;
  color: TagColor;
  position: number;
};

export const BILLING_MODEL_METADATA: Record<BillingModelEnum, BillingModelMetadata> = {
  [BillingModelEnum.PREPAID]: {
    label: 'Pré-Pago',
    color: 'green',
    position: 0,
  },
  [BillingModelEnum.POSTPAID]: {
    label: 'Pós-Pago',
    color: 'orange',
    position: 1,
  },
  [BillingModelEnum.PREPAID_UNLIMITED]: {
    label: 'Pré-Ilimitado',
    color: 'green',
    position: 2,
  },
  [BillingModelEnum.POSTPAID_UNLIMITED]: {
    label: 'Pós-Ilimitado',
    color: 'orange',
    position: 3,
  },
};

export const BILLING_MODEL_OPTIONS = Object.entries(BILLING_MODEL_METADATA).map(
  ([value, { label, color, position }]) => ({
    value,
    label,
    color,
    position,
  }),
);

// Utilitário: Pega o label pelo valor
export function getBillingModelLabel(value: BillingModelEnum | string): string {
  return BILLING_MODEL_METADATA[value as BillingModelEnum]?.label ?? value;
}
