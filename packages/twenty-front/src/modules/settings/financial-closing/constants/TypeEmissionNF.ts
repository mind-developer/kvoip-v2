export enum TypeEmissionNFEnum {
  NOTHING = 'NOTHING',
  AFTER = 'AFTER',
  BEFORE = 'BEFORE'
}

type TypeEmissionNFMetadata = {
  label: string;
  color: 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'gray';
  position: number;
};

export const TYPE_EMISSION_NF_METADATA: Record<TypeEmissionNFEnum, TypeEmissionNFMetadata> = {
  [TypeEmissionNFEnum.NOTHING]: {
    label: 'Não emitir nota fiscal',
    color: 'red',
    position: 0,
  },
  [TypeEmissionNFEnum.AFTER]: {
    label: 'Emitir nota fiscal após o pagamento',
    color: 'purple',
    position: 1,
  },
  [TypeEmissionNFEnum.BEFORE]: {
    label: 'Emitir nota fiscal junto ao fechamento',
    color: 'blue',
    position: 1,
  },
};

export const TYPE_EMISSION_NF_OPTIONS = Object.entries(TYPE_EMISSION_NF_METADATA).map(
  ([value, { label, color, position }]) => ({
    value,
    label,
    color,
    position,
  }),
);

// Utilitário: Pega o label pelo valor
export function getTypeEmissionNFLabel(value: TypeEmissionNFEnum | string): string {
  return TYPE_EMISSION_NF_METADATA[value as TypeEmissionNFEnum]?.label ?? value;
}

// Utilitário: Pega a cor pelo valor
export function getTypeEmissionNFColor(value: TypeEmissionNFEnum | string): 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'gray' {
  return TYPE_EMISSION_NF_METADATA[value as TypeEmissionNFEnum]?.color ?? 'gray';
}
