import { TagColor } from "src/engine/metadata-modules/field-metadata/dtos/options.input";

export enum TypeDiscountEnum {
  PERCENT = 'PERCENT',
  VALUE = 'VALUE',
}

type TypeDiscountMetadata = {
  label: string;
  color: TagColor;
  position: number;
};

export const TYPE_DISCOUNT_METADATA: Record<TypeDiscountEnum, TypeDiscountMetadata> = {
  [TypeDiscountEnum.PERCENT]: {
    label: 'Percentual',
    color: 'blue',
    position: 0,
  },
  [TypeDiscountEnum.VALUE]: {
    label: 'Valor Fixo',
    color: 'purple',
    position: 1,
  },
};

export const TYPE_DISCOUNT_OPTIONS = Object.entries(TYPE_DISCOUNT_METADATA).map(
  ([value, { label, color, position }]) => ({
    value,
    label,
    color,
    position,
  }),
);

// Utilitário: Pega o label pelo valor
export function getTypeDiscountLabel(value: TypeDiscountEnum | string): string {
  return TYPE_DISCOUNT_METADATA[value as TypeDiscountEnum]?.label ?? value;
}
