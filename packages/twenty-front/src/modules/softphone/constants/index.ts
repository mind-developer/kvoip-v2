/* @kvoip-woulz proprietary */
// Export centralizado de constantes SIP e telefonia

// Constantes unificadas
export * from './constants';

// Constantes existentes (mantidas para compatibilidade)
export { default as defaultCallState } from './defaultCallState';
export { default as defaultConfig } from './defaultConfig';
export * from './enum/SoftphoneStatus';

