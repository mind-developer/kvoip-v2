/* @kvoip-woulz proprietary */
import { useCallback } from 'react';
import {
  Inviter,
  Session,
  SessionState,
  UserAgent
} from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';
import {
  CALL_TRANSFER_CONFIG,
  DTMF_CONFIG,
  SESSION_CONFIG
} from '../constants';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import { useAudioDevices } from './useAudioDevices';
import { useSipRefs } from './useSipRefs';

interface UseSipManagerProps {
  config: SipConfig | undefined;
  setCallState: React.Dispatch<React.SetStateAction<CallState>>;
  sipRefs: ReturnType<typeof useSipRefs>;
}

export const useSipManager = ({ config, setCallState, sipRefs }: UseSipManagerProps) => {
  const audioDevices = useAudioDevices();
  
  console.log('useSipManager - sipRefs recebidas:', sipRefs);

  const setupRemoteMedia = useCallback(async (session: Session) => {
    const sessionDescriptionHandler = session.sessionDescriptionHandler as
      | SessionDescriptionHandler
      | undefined;
    
    if (
      !sessionDescriptionHandler ||
      !('peerConnection' in sessionDescriptionHandler)
    ) {
      console.error('Session description handler not found');
      return;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.error('PeerConnection not available');
      return;
    }

    // Configurar o microfone local
    try {
      // Primeiro, parar qualquer stream existente
      const existingSenders = peerConnection.getSenders();
      for (const sender of existingSenders) {
        if (sender.track) {
          sender.track.stop();
        }
      }

      // Configurar o novo stream com o microfone selecionado
      const constraints = {
        audio: {
          deviceId: audioDevices.selectedMicDevice ? { exact: audioDevices.selectedMicDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('Configurando microfone com constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        console.log('Nova trilha de áudio obtida:', audioTrack.label);
        
        // Substituir a trilha de áudio existente
        const audioSender = peerConnection.getSenders().find(sender => sender.track?.kind === 'audio');
        if (audioSender) {
          await audioSender.replaceTrack(audioTrack);
          console.log('Microfone configurado com sucesso:', audioDevices.selectedMicDevice);
        } else {
          console.error('Nenhum sender de áudio encontrado');
        }
      }
    } catch (error) {
      console.error('Erro ao configurar microfone:', error);
    }

    if (sipRefs.remoteAudioRef.current) {
      const remoteStream = new MediaStream();
      peerConnection.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) {
          remoteStream.addTrack(receiver.track);
        }
      });
      sipRefs.remoteAudioRef.current.srcObject = remoteStream;
      sipRefs.remoteAudioRef.current.play().catch((error) => {
        console.error('Error playing remote audio:', error);
      });
    }
  }, [audioDevices.selectedMicDevice, sipRefs.remoteAudioRef]);

  const cleanupSession = useCallback(async () => {
    if (sipRefs.sessionRef.current) {
      try {
        if (sipRefs.sessionRef.current.state === SessionState.Established) {
          await sipRefs.sessionRef.current.bye();
        } else if (sipRefs.sessionRef.current.state === SessionState.Establishing) {
          if (sipRefs.sessionRef.current instanceof Inviter)
            await sipRefs.sessionRef.current.cancel();
        }
      } catch (error) {
        console.error('Error cleaning up session:', error);
      }
      sipRefs.sessionRef.current = null;
    }
    if (sipRefs.invitationRef.current) {
      try {
        if (sipRefs.invitationRef.current.state !== SessionState.Terminated) {
          await sipRefs.invitationRef.current.reject();
        }
      } catch (error) {
        console.error('Error rejecting invitation:', error);
      }
      sipRefs.invitationRef.current = null;
    }

    // Clear all timers
    if (sipRefs.timerRef.current) {
      clearInterval(sipRefs.timerRef.current);
    }
    if (sipRefs.ringingTimerRef.current) {
      clearInterval(sipRefs.ringingTimerRef.current);
    }

    // Stop hold music
    if (audioDevices.holdAudioRef.current) {
      audioDevices.holdAudioRef.current.pause();
      audioDevices.holdAudioRef.current.currentTime = 0;
    }

    // Stop ringtone
    if (audioDevices.ringAudioRef.current) {
      console.log('Parando ringtone...');
      audioDevices.ringAudioRef.current.pause();
      audioDevices.ringAudioRef.current.currentTime = 0;
      audioDevices.ringAudioRef.current = null;
      console.log('Ringtone parado');
    } else {
      console.log('Nenhum ringtone para parar');
    }

    setCallState((prev) => ({
      ...prev,
      isInCall: false,
      isMuted: false,
      isOnHold: false,
      incomingCall: false,
      incomingCallNumber: '',
      callStatus: CallStatus.NONE,
      callStartTime: null,
      ringingStartTime: null,
    }));

    if (sipRefs.remoteAudioRef.current) {
      sipRefs.remoteAudioRef.current.srcObject = null;
    }
  }, [sipRefs, audioDevices, setCallState]);

  const sendDTMF = useCallback((tone: string) => {
    if (
      !sipRefs.sessionRef.current ||
      sipRefs.sessionRef.current.state !== SessionState.Established
    ) {
      console.log('Não é possível enviar DTMF: chamada não está ativa');
      return;
    }

    const sessionDescriptionHandler = sipRefs.sessionRef.current
      .sessionDescriptionHandler as SessionDescriptionHandler | undefined;
    if (
      !sessionDescriptionHandler ||
      !('peerConnection' in sessionDescriptionHandler)
    ) {
      console.error('Session description handler não encontrado');
      return;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.error('PeerConnection não disponível');
      return;
    }

    const dtmfSender = peerConnection
      .getSenders()
      .find((sender) => sender.track?.kind === 'audio')?.dtmf;

    if (!dtmfSender) {
      console.error('DTMF sender não disponível');
      return;
    }

    console.log('Enviando DTMF:', tone);
    dtmfSender.insertDTMF(tone, DTMF_CONFIG.TONE_DURATION);
  }, [sipRefs.sessionRef]);

  const handleCall = useCallback(async (currentNumber: string) => {
    console.log('handleCall chamado com:', currentNumber);
    console.log('userAgentRef.current:', sipRefs.userAgentRef.current);
    console.log('config:', config);
    
    if (!currentNumber || !sipRefs.userAgentRef.current) {
      console.log('Retornando: currentNumber ou userAgentRef não disponível');
      return;
    }

    try {
      console.log('Iniciando chamada...');
      await cleanupSession();
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.STARTING_CALL,
        ringingStartTime: Date.now(),
      }));

      const target = UserAgent.makeURI(
        `sip:${currentNumber}@${config?.domain}`,
      );
      if (!target) {
        throw new Error('Failed to create target URI');
      }
      
      console.log('Target URI criado:', target.toString());

      const inviter = new Inviter(sipRefs.userAgentRef.current, target, {
        extraHeaders: SESSION_CONFIG.EXTRA_HEADERS,
        sessionDescriptionHandlerOptions: {
          constraints: SESSION_CONFIG.MEDIA_CONSTRAINTS,
        },
      });

      sipRefs.sessionRef.current = inviter;

      console.log('Inviting:', inviter);

      inviter.stateChange.addListener(async (state: SessionState) => {
        console.log('Call state changed:', state);
        if (state === SessionState.Establishing) {
          setCallState((prev) => ({
            ...prev,
            callStatus: CallStatus.CALLING,
            ringingStartTime: prev.ringingStartTime || Date.now(),
          }));
        } else if (state === SessionState.Established) {
          sipRefs.sessionRef.current = inviter;
          setupRemoteMedia(inviter);
          setCallState((prev) => ({
            ...prev,
            isInCall: true,
            callStatus: CallStatus.CONNECTED,
            callStartTime: Date.now(),
            ringingStartTime: null,
          }));
          console.log('Active call established:', inviter);
        } else if (state === SessionState.Terminated) {
          await cleanupSession();
        }
      });

      await inviter.invite();
    } catch (error) {
      console.error('Call error:', error);
      await cleanupSession();
    }
  }, [config, sipRefs, cleanupSession, setupRemoteMedia, setCallState]);

  const handleAcceptCall = useCallback(async () => {
    if (!sipRefs.invitationRef.current) {
      console.log('entrou aqui');
      return;
    }

    try {
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.ACCEPTING_CALL,
        ringingStartTime: null,
        callStartTime: Date.now(),
      }));

      await sipRefs.invitationRef.current.accept({
        sessionDescriptionHandlerOptions: {
          constraints: SESSION_CONFIG.MEDIA_CONSTRAINTS,
        },
      });

      setupRemoteMedia(sipRefs.invitationRef.current);
      console.log('Incoming call accepted:', sipRefs.invitationRef.current);
    } catch (error) {
      console.error('Error accepting call:', error);
      await cleanupSession();
    }
  }, [sipRefs, setupRemoteMedia, setCallState, cleanupSession]);

  const handleRejectCall = useCallback(async () => {
    console.log('handleRejectCall chamado');
    if (!sipRefs.invitationRef.current) {
      console.log('Nenhuma invitation para rejeitar');
      return;
    }

    try {
      console.log('Rejeitando chamada...');
      sipRefs.invitationRef.current.reject();
      console.log('Chamada rejeitada com sucesso');
    } catch (error) {
      console.error('Error rejecting call:', error);
    } finally {
      console.log('Executando cleanupSession...');
      await cleanupSession();
      console.log('cleanupSession executado');
    }
  }, [sipRefs, cleanupSession]);

  const handleMute = useCallback(() => {
    if (sipRefs.sessionRef.current?.state === SessionState.Established) {
      try {
        const audioTrack = (
          sipRefs.sessionRef.current.sessionDescriptionHandler as
            | SessionDescriptionHandler
            | undefined
        )?.peerConnection
          ?.getSenders()
          .find((sender) => sender.track?.kind === 'audio');

        if (audioTrack?.track) {
          audioTrack.track.enabled = !audioTrack.track.enabled;
          setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  }, [sipRefs.sessionRef, setCallState]);

  const transferCall = useCallback((to: string) => {
    const sessionManager = new (require('sip.js/lib/platform/web').SessionManager)(
      CALL_TRANSFER_CONFIG.SERVER_URL,
      { registererOptions: CALL_TRANSFER_CONFIG.REGISTERER_OPTIONS },
    );

    if (sipRefs.sessionRef.current)
      sessionManager?.transfer(
        sipRefs.sessionRef.current,
        `sip:${to}@${CALL_TRANSFER_CONFIG.TRANSFER_DOMAIN}`,
      );
  }, [sipRefs.sessionRef]);

  return {
    handleCall,
    handleAcceptCall,
    handleRejectCall,
    handleMute,
    cleanupSession,
    sendDTMF,
    transferCall,
    setupRemoteMedia
  };
};
