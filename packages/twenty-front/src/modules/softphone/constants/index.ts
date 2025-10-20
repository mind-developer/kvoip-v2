/* @kvoip-woulz proprietary */
// Export centralizado de constantes SIP e telefonia

// Constantes de configuração SIP
export * from './sip';

// Constantes de telefonia
export * from './telephony';

// Constantes existentes (mantidas para compatibilidade)
export { default as defaultCallState } from './defaultCallState';
export { default as defaultConfig } from './defaultConfig';
export * from './enum/SoftphoneStatus';

