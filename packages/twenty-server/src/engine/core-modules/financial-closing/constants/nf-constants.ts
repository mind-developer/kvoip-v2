
// Códigos de Unidade de Medida
export enum UnitOfMeasureEnum {
  UN = '4', // Unidade
}

// Valores de Unidade
export const UNIT_VALUES = {
  DEFAULT: '1.00',
  SINGLE: '1',
} as const;

// Classificações NFCom
export enum NfComClassificationEnum {
  TELEPHONY_SERVICE = '0100101', // Assinatura de serviços de telefonia
}

// CST ICMS/CSOSN
export enum CstIcmsCsosnEnum {
  NORMAL_REGIME = '00', // Regime normal
  SIMPLES_NACIONAL = '102', // Simples Nacional (SN)
}

// Alíquotas ISS
export const ISS_RATES = {
  MIN: 0.02, // 2%
  MAX: 0.05, // 5%
  DEFAULT: 0.05, // 5% (padrão)
} as const;

// Itens da Lista de Serviço
export enum ServiceListItemEnum {
  TELEPHONY = '2919', // Serviço de telefonia
}

// CFOPs para Comunicação
export enum CfopCommunicationEnum {
  EXTERIOR = '7307', // Prestação para exterior
  INTRASTATE = '5307', // Prestação dentro do estado
  INTERSTATE = '6307', // Prestação interestadual
}

// Textos padrão
export const NF_TEXTS = {
  TELEPHONY_PLAN: 'Plano de telefonia',
  TELEPHONY_SERVICE: 'Serviço de telefonia',
} as const;

// Estados válidos do Brasil
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

// Labels simples para CST ICMS/CSOSN
export const CST_ICMS_CSOSN_LABELS = {
  [CstIcmsCsosnEnum.NORMAL_REGIME]: 'Regime Normal',
  [CstIcmsCsosnEnum.SIMPLES_NACIONAL]: 'Simples Nacional',
} as const;

// Labels para CFOPs
export const CFOP_LABELS = {
  [CfopCommunicationEnum.EXTERIOR]: 'Prestação para Exterior',
  [CfopCommunicationEnum.INTRASTATE]: 'Prestação Intramunicipal',
  [CfopCommunicationEnum.INTERSTATE]: 'Prestação Interestadual',
} as const;

// Utilitários
export function getCstIcmsCsosnLabel(value: CstIcmsCsosnEnum | string): string {
  return CST_ICMS_CSOSN_LABELS[value as CstIcmsCsosnEnum] ?? value;
}

export function getCfopLabel(value: CfopCommunicationEnum | string): string {
  return CFOP_LABELS[value as CfopCommunicationEnum] ?? value;
}

export function isValidBrazilianState(state: string): boolean {
  return BRAZILIAN_STATES.includes(state.trim().toUpperCase() as any);
}

export function normalizeState(state: string): string {
  return state.trim().toUpperCase();
}
