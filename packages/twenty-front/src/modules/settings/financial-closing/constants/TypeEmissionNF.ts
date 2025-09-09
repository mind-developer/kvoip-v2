import { useLingui } from '@lingui/react/macro';

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

// Hook para traduções do TypeEmissionNF
export const useTypeEmissionNFTranslations = () => {
  const { t } = useLingui();

  const getTypeEmissionNFLabel = (value: TypeEmissionNFEnum | string): string => {
    switch (value) {
      case TypeEmissionNFEnum.NOTHING:
        return t`Do not emit invoice`;
      case TypeEmissionNFEnum.AFTER:
        return t`Emit invoice after payment`;
      case TypeEmissionNFEnum.BEFORE:
        return t`Emit invoice together with the closing`;
      default:
        return value as string;
    }
  };

  const getTypeEmissionNFMetadata = (): Record<TypeEmissionNFEnum, TypeEmissionNFMetadata> => ({
    [TypeEmissionNFEnum.NOTHING]: {
      label: t`Do not emit invoice`,
      color: 'red',
      position: 0,
    },
    [TypeEmissionNFEnum.AFTER]: {
      label: t`Emit invoice after payment`,
      color: 'purple',
      position: 1,
    },
    [TypeEmissionNFEnum.BEFORE]: {
      label: t`Emit invoice together with the closing`,
      color: 'blue',
      position: 1,
    },
  });

  const getTypeEmissionNFOptions = () => {
    const metadata = getTypeEmissionNFMetadata();
    return Object.entries(metadata).map(
      ([value, { label, color, position }]) => ({
        value,
        label,
        color,
        position,
      }),
    );
  };

  return {
    getTypeEmissionNFLabel,
    getTypeEmissionNFMetadata,
    getTypeEmissionNFOptions,
  };
};

// Funções estáticas para compatibilidade (sem tradução)
export const TYPE_EMISSION_NF_METADATA: Record<TypeEmissionNFEnum, TypeEmissionNFMetadata> = {
  [TypeEmissionNFEnum.NOTHING]: {
    label: 'Do not emit invoice',
    color: 'red',
    position: 0,
  },
  [TypeEmissionNFEnum.AFTER]: {
    label: 'Emit invoice after payment',
    color: 'purple',
    position: 1,
  },
  [TypeEmissionNFEnum.BEFORE]: {
    label: 'Emit invoice together with the closing',
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

// Utilitário: Pega o label pelo valor (sem tradução)
export function getTypeEmissionNFLabel(value: TypeEmissionNFEnum | string): string {
  return TYPE_EMISSION_NF_METADATA[value as TypeEmissionNFEnum]?.label ?? value;
}

// Utilitário: Pega a cor pelo valor
export function getTypeEmissionNFColor(value: TypeEmissionNFEnum | string): 'red' | 'purple' | 'blue' | 'green' | 'orange' | 'gray' {
  return TYPE_EMISSION_NF_METADATA[value as TypeEmissionNFEnum]?.color ?? 'gray';
}
