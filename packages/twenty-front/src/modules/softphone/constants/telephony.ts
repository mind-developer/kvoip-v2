/* @kvoip-woulz proprietary */
// Constantes de telefonia e configurações de chamada

/**
 * Configurações de transferência de chamada
 */
export const CALL_TRANSFER_CONFIG = {
  /** URL do servidor para transferência */
  SERVER_URL: 'wss://webrtc.dazsoft.com:8080/ws',
  
  /** Opções do registrador para transferência */
  REGISTERER_OPTIONS: {
    extraHeaders: ['X-oauth-dazsoft: 1'] as string[],
  },
  
  /** Domínio para transferência */
  TRANSFER_DOMAIN: 'suite.pabx.digital',
} as const;

/**
 * Configurações de áudio para telefonia
 */
export const TELEPHONY_AUDIO_CONFIG = {
  /** URL do arquivo de toque de chamada */
  RINGTONE_URL: 'https://kvoip.com.br/toquedechamada.mp3',
  
  /** Configurações de áudio para WebRTC */
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
} as const;

/**
 * Configurações de DTMF
 */
export const DTMF_CONFIG = {
  /** Duração padrão dos tons DTMF (em milissegundos) */
  TONE_DURATION: 100,
} as const;
