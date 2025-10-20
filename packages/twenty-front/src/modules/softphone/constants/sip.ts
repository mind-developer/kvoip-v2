/* @kvoip-woulz proprietary */
// Constantes de configuração e conexão SIP

/**
 * Configurações padrão do servidor SIP
 */
export const SIP_SERVER_CONFIG = {
  /** Domínio padrão do servidor SIP */
  DOMAIN: 'suite.pabx.digital',
  
  /** Proxy padrão do servidor SIP */
  PROXY: 'webrtc.dazsoft.com:8080',
  
  /** Protocolo padrão (WebSocket Secure) */
  PROTOCOL: 'wss://',
  
  /** Servidor STUN para conexões WebRTC */
  STUN_SERVER: 'stun:stun.l.google.com:19302',
} as const;

/**
 * Configurações do UserAgent SIP
 */
export const USER_AGENT_CONFIG = {
  /** String de identificação do UserAgent */
  USER_AGENT_STRING: 'RamalWeb/1.1.11',
  
  /** Timeout para chamadas sem resposta (em segundos) */
  NO_ANSWER_TIMEOUT: 60,
  
  /** Nível de log do UserAgent */
  LOG_LEVEL: 'error' as const,
  
  /** Hack para IP no Contact header */
  HACK_IP_IN_CONTACT: false,
} as const;

/**
 * Configurações de registro SIP
 */
export const REGISTRATION_CONFIG = {
  /** Tempo de expiração do registro (em segundos) */
  EXPIRES: 10,
  
  /** ID do registro */
  REG_ID: 1,
  
  /** Intervalo para renovação do registro (em milissegundos) */
  RENEWAL_INTERVAL: 270000, // 4.5 minutos
  
  /** Headers extras para registro */
  EXTRA_HEADERS: ['X-oauth-dazsoft: 1'] as string[],
} as const;

/**
 * Configurações de sessão SIP
 */
export const SESSION_CONFIG = {
  /** Headers extras para sessões */
  EXTRA_HEADERS: ['X-oauth-dazsoft: 1'] as string[],
  
  /** Configurações de mídia */
  MEDIA_CONSTRAINTS: {
    audio: true,
    video: false,
  },
  
  /** Configurações de DTMF */
  DTMF_CONFIG: {
    /** Duração do tom DTMF (em milissegundos) */
    TONE_DURATION: 100,
    
    /** Mapeamento RTP para eventos telefônicos */
    RTP_MAP: 'a=rtpmap:101 telephone-event/8000',
    
    /** Parâmetros de formato para eventos telefônicos */
    FORMAT_PARAMS: 'a=fmtp:101 0-15',
  },
} as const;

/**
 * Configurações de WebRTC
 */
export const WEBRTC_CONFIG = {
  /** Servidores ICE para conexões WebRTC */
  ICE_SERVERS: [
    { urls: [SIP_SERVER_CONFIG.STUN_SERVER] }
  ],
} as const;
