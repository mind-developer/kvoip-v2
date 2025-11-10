/* @kvoip-woulz proprietary */
// Utilitários para modificação de SDP para DTMF

import { SDP_MODIFIER_CONFIG, SESSION_CONFIG } from '../constants';

/**
 * Modifica o SDP para garantir suporte adequado ao DTMF
 * @param sdp - String SDP original
 * @returns String SDP modificada com suporte ao DTMF
 */
export const modifySdpForDtmf = (sdp: string): string => {
  try {
    let modifiedSdp = sdp;

    // Garantir que o payload 101 esteja listado na linha m=audio
    modifiedSdp = addPayloadToMAudio(modifiedSdp);

    // Garantir rtpmap para telephone-event (payload 101)
    modifiedSdp = addRtpMapForTelephoneEvent(modifiedSdp);

    // Garantir fmtp para telephone-event (payload 101)
    modifiedSdp = addFmtpForTelephoneEvent(modifiedSdp);
    
    return modifiedSdp;
  } catch (error) {
    console.error('Erro ao modificar SDP:', error);
    console.log('SDP Original mantido:', sdp);
    return sdp;
  }
};

/**
 * Adiciona o payload 101 na linha m=audio se não estiver presente
 * @param sdp - String SDP
 * @returns String SDP modificada
 */
const addPayloadToMAudio = (sdp: string): string => {
  return sdp.replace(SDP_MODIFIER_CONFIG.M_AUDIO_REGEX, (line) => {
    if (SDP_MODIFIER_CONFIG.PAYLOAD_101_REGEX.test(line)) {
      console.log('✅ Payload 101 já presente na linha m=audio:', line);
      return line;
    } else {
      console.log('✅ Adicionando payload 101 na linha m=audio:', line);
      return `${line} ${SESSION_CONFIG.DTMF_CONFIG.PAYLOAD_ID}`;
    }
  });
};

/**
 * Adiciona o rtpmap para telephone-event se não estiver presente
 * @param sdp - String SDP
 * @returns String SDP modificada
 */
const addRtpMapForTelephoneEvent = (sdp: string): string => {
  const rtpmapLine = `a=rtpmap:${SESSION_CONFIG.DTMF_CONFIG.PAYLOAD_ID} ${SESSION_CONFIG.DTMF_CONFIG.TELEPHONE_EVENT_CODEC}`;
  
  if (sdp.includes(rtpmapLine)) {
    console.log('✅ rtpmap:101 telephone-event/8000 já existe');
    return sdp;
  }

  // Procurar por uma linha a=rtpmap existente para inserir após ela
  const rtpmapMatches = [...sdp.matchAll(SDP_MODIFIER_CONFIG.RTPMAP_REGEX)];
  
  if (rtpmapMatches.length > 0) {
    // Inserir após a última linha a=rtpmap
    const lastMatch = rtpmapMatches[rtpmapMatches.length - 1];
    const insertPoint = lastMatch.index! + lastMatch[0].length;
    const newSdp = sdp.slice(0, insertPoint) + 
                  SDP_MODIFIER_CONFIG.LINE_BREAK + rtpmapLine + 
                  sdp.slice(insertPoint);
    console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após:', lastMatch[0]);
    return newSdp;
  } else {
    // Se não há a=rtpmap, adicionar após a linha m=audio
    const mAudioMatch = sdp.match(SDP_MODIFIER_CONFIG.M_AUDIO_REGEX);
    if (mAudioMatch) {
      const insertPoint = mAudioMatch.index! + mAudioMatch[0].length;
      const newSdp = sdp.slice(0, insertPoint) + 
                    SDP_MODIFIER_CONFIG.LINE_BREAK + rtpmapLine + 
                    sdp.slice(insertPoint);
      console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após m=audio');
      return newSdp;
    }
  }
  
  return sdp;
};

/**
 * Adiciona o fmtp para telephone-event se não estiver presente
 * @param sdp - String SDP
 * @returns String SDP modificada
 */
const addFmtpForTelephoneEvent = (sdp: string): string => {
  const fmtpLine = `a=fmtp:${SESSION_CONFIG.DTMF_CONFIG.PAYLOAD_ID} ${SESSION_CONFIG.DTMF_CONFIG.FORMAT_PARAMS_VALUE}`;
  
  if (SDP_MODIFIER_CONFIG.FMTP_101_REGEX.test(sdp)) {
    console.log('✅ fmtp:101 0-15 já existe');
    return sdp;
  }

  // Adicionar fmtp após o rtpmap:101
  const rtpmap101Match = sdp.match(SDP_MODIFIER_CONFIG.RTPMAP_101_REGEX);
  if (rtpmap101Match) {
    const insertPoint = rtpmap101Match.index! + rtpmap101Match[0].length;
    const newSdp = sdp.slice(0, insertPoint) + 
                  SDP_MODIFIER_CONFIG.LINE_BREAK + fmtpLine + 
                  sdp.slice(insertPoint);
    console.log('✅ Adicionado fmtp:101 0-15 após rtpmap:101');
    return newSdp;
  } else {
    const newSdp = sdp + SDP_MODIFIER_CONFIG.LINE_BREAK + fmtpLine;
    console.log('✅ Adicionado fmtp:101 0-15 no final');
    return newSdp;
  }
};

/**
 * Cria o modificador SDP para DTMF usando as constantes configuradas
 * @returns Função modificadora de SDP
 */
export const createDtmfSdpModifier = () => {
  return (description: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
    if (description.sdp) {
      description.sdp = modifySdpForDtmf(description.sdp);
    }
    return Promise.resolve(description);
  };
};
