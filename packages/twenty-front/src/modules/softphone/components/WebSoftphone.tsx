/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import IncomingCallBody from '@/softphone/components/dialer/IncomingCallBody';
import IncomingCallHeader from '@/softphone/components/dialer/IncomingCallHeader';
import DTMFButton from '@/softphone/components/ui/DTMFButton';
import Keyboard from '@/softphone/components/ui/Keyboard';
import KeyboardToggleButton from '@/softphone/components/ui/KeyboardToggleButton';
import StatusIndicator from '@/softphone/components/ui/StatusPill';
import { SoftphoneStatus } from '@/softphone/constants/SoftphoneStatus';
import { TextInput } from '@/ui/input/components/TextInput';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  UserAgent
} from 'sip.js';
import {
  SessionDescriptionHandler,
  SessionManager,
} from 'sip.js/lib/platform/web';
import { IconArrowLeft, IconPhone, IconSettings, useIcons } from 'twenty-ui/display';
import defaultCallState from '../constants/DefaultCallState';
import { useAudioDevices } from '../hooks/useAudioDevices';
import { useCallAudio } from '../hooks/useCallAudio';
import { useCallStates } from '../hooks/useCallStates';
import { useDialingTone } from '../hooks/useDialingTone';
import { useRingTone } from '../hooks/useRingTone';
import { useSipConfig } from '../hooks/useSipConfig';
import { useSipRefs } from '../hooks/useSipRefs';
import { useTelephonyUserData } from '../hooks/useTelephonyUserData';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import formatTime from '../utils/formatTime';
import generateAuthorizationHa1 from '../utils/generateAuthorizationHa1';
import AudioDevicesModal from './modal/AudioDevicesModal';
import HoldButton from './ui/HoldButton';
import TransferButton from './ui/TransferButton';

const StyledContainer = styled.div<{ status: SoftphoneStatus }>`
  background-color: ${({ theme }) => theme.background.tertiary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(3)};
  width: 300px;
  position: relative;
  cursor: grab;
  gap: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  
  box-shadow: 0 0 5px 0 ${({ status, theme }) =>
    status === SoftphoneStatus.Online
      ? theme.color.green40
      : status === SoftphoneStatus.Registering
        ? theme.color.yellow40
        : theme.color.red40};
`;

const StyledControlsContainer = styled.div<{ column?: boolean; gap?: number }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  gap: ${({ theme, gap }) => theme.spacing(gap || 1)};
`;

const StyledIncomingText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: normal;
`;

const StyledIncomingNumber = styled.span<{ alignSelf?: string }>`
  align-self: ${({ alignSelf }) => alignSelf || 'start'};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;


const StyledTextAndCallButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDefaultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledIncomingTimerAndIcon = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledStatusAndTimer = styled.div`
  align-items: center;
  justify-content: space-between;
  display: flex;
  width: 100%;
`;

const StyledOngoingCallContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledEndButton = styled.div`
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ theme }) => theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-block: ${({ theme }) => theme.spacing(2)};

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.red50};
  }
`;

const StyledSettingsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.secondary};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const WebSoftphone: React.FC = () => {
  // Estados locais
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  
  // Hooks customizados
  const { telephonyExtension } = useTelephonyUserData();
  const { config, setConfig } = useSipConfig(telephonyExtension);
  const { isRinging, isIncomingCall, isActiveCall } = useCallStates(callState);
  const audioDevices = useAudioDevices();
  const sipRefs = useSipRefs();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(false);
  const [isSendingDTMF, setIsSendingDTMF] = useState(false);
  const [dtmf, setDtmf] = useState('');

  // Hooks de UI
  const { openModal } = useModal();
  const { getIcon } = useIcons();
  const { t } = useLingui();

  // Hooks de áudio
  useRingTone(isRinging, isIncomingCall);
  useDialingTone(isRinging, isActiveCall);
  useCallAudio(sipRefs.remoteAudioRef.current);

  useEffect(() => {
    if (config?.username && config?.password && config?.domain) {
      updateConfigWithHa1();
    }
    return () => {
      onComponentUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.username, config?.password, config?.domain]);

  const startTimer = (
    startTime: number | null,
    setTime: React.Dispatch<React.SetStateAction<string>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  ) => {
    if (startTime) {
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        setTime(formatTime(elapsed));
      };
      updateTimer();
      timerRef.current = window.setInterval(
        updateTimer,
        1000,
      ) as unknown as ReturnType<typeof setInterval>;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setTime('00:00');
    }
  };

  useEffect(
    () => startTimer(callState.callStartTime, setElapsedTime, sipRefs.timerRef),
    [callState.callStartTime],
  );

  useEffect(
    () =>
      startTimer(callState.ringingStartTime, setRingingTime, sipRefs.ringingTimerRef),
    [callState.ringingStartTime],
  );


  // Função para configurar o dispositivo de áudio
  const setAudioDevice = async (audioElement: HTMLAudioElement, deviceId: string) => {
    if ('setSinkId' in audioElement) {
      try {
        await (audioElement as any).setSinkId(deviceId);
        console.log('Dispositivo de áudio configurado com sucesso:', deviceId);
      } catch (error) {
        console.error('Erro ao configurar dispositivo de áudio:', error);
      }
    }
  };

  // Função para tocar o som de chamada
  const playRingtone = async () => {
    try {
      // Parar qualquer toque anterior
      if (audioDevices.ringAudioRef.current) {
        audioDevices.ringAudioRef.current.pause();
        audioDevices.ringAudioRef.current.currentTime = 0;
      }

      // Criar novo elemento de áudio
      const audio = new Audio('https://kvoip.com.br/toquedechamada.mp3');
      audioDevices.ringAudioRef.current = audio;

      // Configurar o dispositivo de toque
      if (audioDevices.selectedRingDevice) {
        await setAudioDevice(audio, audioDevices.selectedRingDevice);
      }

      // Reproduzir o toque
      await audio.play();
      console.log('Toque iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao tocar o som de chamada:', error);
    }
  };

  // Função para parar o toque
  const stopRingtone = () => {
    if (audioDevices.ringAudioRef.current) {
      audioDevices.ringAudioRef.current.pause();
      audioDevices.ringAudioRef.current.currentTime = 0;
      audioDevices.ringAudioRef.current = null;
    }
  };

  // Função para configurar o áudio da chamada
  const setupCallAudio = async () => {
    try {
      // Parar o toque
      stopRingtone();

      // Configurar o dispositivo de chamada
      if (audioDevices.callAudioRef.current && audioDevices.selectedCallDevice) {
        await setAudioDevice(audioDevices.callAudioRef.current, audioDevices.selectedCallDevice);
      }
    } catch (error) {
      console.error('Erro ao configurar áudio da chamada:', error);
    }
  };

  // Atualizar o estado da chamada
  useEffect(() => {
    if (callState.callStatus === CallStatus.INCOMING_CALL) {
      playRingtone();
    } else if (callState.callStatus === CallStatus.CONNECTED) {
      setupCallAudio();
    } else if (callState.callStatus === CallStatus.NONE) {
      stopRingtone();
    }
  }, [callState.callStatus]);

  const updateConfigWithHa1 = async () => {
    const authorizationHa1 = await generateAuthorizationHa1(
      config?.username || '',
      config?.password || '',
      config?.domain || '',
    );
    const updatedConfig = {
      ...config,
      authorizationHa1,
    };
    setConfig(updatedConfig);
    initializeSIP(updatedConfig);
  };

  const cleanupSession = async () => {
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

    setDtmf('');
    setIsSendingDTMF(false);

    if (sipRefs.remoteAudioRef.current) {
      sipRefs.remoteAudioRef.current.srcObject = null;
    }
  };

  const onComponentUnmount = async () => {
    await cleanupSession();
    if (sipRefs.registererRef.current) {
      sipRefs.registererRef.current.unregister();
    }
    if (sipRefs.userAgentRef.current) {
      sipRefs.userAgentRef.current.stop();
    }
    if (sipRefs.registerIntervalRef.current) {
      clearInterval(sipRefs.registerIntervalRef.current);
    }
  };

  const setupRemoteMedia = async (session: Session) => {
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
  };

  const updateMicrophoneInRealTime = async () => {
    if (sipRefs.sessionRef.current?.state === SessionState.Established) {
      try {
        const sessionDescriptionHandler = sipRefs.sessionRef.current.sessionDescriptionHandler as SessionDescriptionHandler;
        if (!sessionDescriptionHandler || !('peerConnection' in sessionDescriptionHandler)) {
          console.error('Session description handler não encontrado');
          return;
        }

        const peerConnection = sessionDescriptionHandler.peerConnection;
        if (!peerConnection) {
          console.error('PeerConnection não disponível');
          return;
        }

        // Encontrar o sender de áudio atual
        const audioSender = peerConnection.getSenders().find(sender => sender.track?.kind === 'audio');
        if (!audioSender) {
          console.error('Nenhum sender de áudio encontrado');
          return;
        }

        // Parar a trilha antiga antes de configurar a nova
        if (audioSender.track) {
          audioSender.track.stop();
        }

        // Configurar novo stream com o microfone selecionado
        const constraints = {
          audio: {
            deviceId: audioDevices.selectedMicDevice ? { exact: audioDevices.selectedMicDevice } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };

        console.log('Configurando novo microfone:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!stream) {
          console.error('Falha ao obter novo stream de áudio');
          return;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) {
          console.error('Nenhuma trilha de áudio encontrada no novo stream');
          return;
        }

        console.log('Nova trilha de áudio obtida:', audioTrack.label);
        
        // Substituir a trilha no sender
        await audioSender.replaceTrack(audioTrack);
        console.log('Microfone atualizado com sucesso:', audioDevices.selectedMicDevice);

        // Verificar se a troca foi bem sucedida
        const newTrack = audioSender.track;
        if (newTrack && newTrack.enabled) {
          console.log('Nova trilha de áudio ativa e funcionando');
        } else {
          console.error('Falha ao ativar nova trilha de áudio');
        }

      } catch (error) {
        console.error('Erro ao atualizar microfone em tempo real:', error);
      }
    } else {
      console.log('Não é possível atualizar microfone: chamada não está ativa');
    }
  };

  // Monitorar mudanças no microfone selecionado
  useEffect(() => {
    if (audioDevices.selectedMicDevice) {
      console.log('Microfone alterado para:', audioDevices.selectedMicDevice);
      updateMicrophoneInRealTime();
    }
  }, [audioDevices.selectedMicDevice]);

  // Monitorar mudanças no dispositivo de chamada selecionado
  useEffect(() => {
    if (sipRefs.remoteAudioRef.current && audioDevices.selectedCallDevice) {
      if ('setSinkId' in sipRefs.remoteAudioRef.current) {
        (sipRefs.remoteAudioRef.current as any).setSinkId(audioDevices.selectedCallDevice)
          .then(() => console.log('Dispositivo de chamada configurado:', audioDevices.selectedCallDevice))
          .catch((error: Error) => console.error('Erro ao configurar dispositivo de chamada:', error));
      }
    }
  }, [audioDevices.selectedCallDevice]);

  const initializeSIP = async (updatedConfig: SipConfig | undefined) => {
    if (!updatedConfig) return;

    try {
      if (
        !updatedConfig.username ||
        !updatedConfig.password ||
        !updatedConfig.domain
      ) {
        throw new Error('Missing required configuration');
      }

      console.log('Initializing SIP connection...', { updatedConfig });
      setCallState((prev) => ({ ...prev, isRegistering: true }));

      const uri = UserAgent.makeURI(
        `sip:${updatedConfig.username}@${updatedConfig.domain}`,
      );
      if (!uri) {
        throw new Error('Failed to create URI');
      }

      const wsServer = `${updatedConfig.protocol}${updatedConfig.proxy}`;

      const userAgent = new UserAgent({
        uri,
        userAgentString: 'RamalWeb/1.1.11', // Define o UserAgent
        transportOptions: {
          server: wsServer,
          traceSip: true,
          wsServers: [wsServer],
        },
        authorizationUsername: updatedConfig.username,
        authorizationPassword: updatedConfig.password,
        displayName: updatedConfig.username,
        contactName: updatedConfig.username,
        noAnswerTimeout: 60,
        hackIpInContact: false,
        logLevel: 'error',
        logConnector: console.log,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: false,
          },
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
            },
          },
          modifiers: [
            (description: RTCSessionDescriptionInit) => {
              description.sdp = description.sdp?.replace(
                'a=rtpmap:101 telephone-event/8000',
                'a=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-15',
              );
              return Promise.resolve(description);
            },
          ],
        },
      });

      // Manter o UserAgent na referência
      sipRefs.userAgentRef.current = userAgent;

      // Evento para encerrar a conexão quando a página for fechada ou recarregada
      window.addEventListener('beforeunload', () => {
        if (sipRefs.userAgentRef.current) {
          sipRefs.userAgentRef.current.stop(); // Encerra a conexão SIP
          console.log('Conexão SIP encerrada.');
        }
      });

      userAgent.delegate = {
        onInvite: (invitation) => {
          console.log('Incoming call received');

          // Don't clean up the session for incoming calls - this prevents race conditions
          // We'll only clean up if there's already an active call
          if (sipRefs.sessionRef.current || sipRefs.invitationRef.current) {
            console.log('Session state:', sipRefs.sessionRef.current?.state);
            cleanupSession();
          }

          sipRefs.invitationRef.current = invitation;
          const fromNumber = invitation.remoteIdentity.uri.user;
          setCallState((prev) => ({
            ...prev,
            incomingCall: true,
            incomingCallNumber: fromNumber || '',
            ringingStartTime: Date.now(),
            callStatus: CallStatus.INCOMING_CALL,
          }));

          invitation.delegate = {
            onCancel: () => {
              console.log('Call cancelled by remote party');
              if (sipRefs.sessionRef.current && sipRefs.sessionRef.current.state !== SessionState.Established) {
                cleanupSession();
              }
            }
          };
          //Analisa se a chamada realmente foi encerrada
          invitation.stateChange.addListener((state: SessionState) => {
            console.log('Incoming call state changed:', state);
            
            if (state === SessionState.Establishing) {
              setCallState((prev) => ({
                ...prev,
                callStatus: CallStatus.CONNECTING,
              }));
            } else if (state === SessionState.Established) {
              sipRefs.sessionRef.current = invitation;
              setupRemoteMedia(invitation);
              setCallState((prev) => ({
                ...prev,
                isInCall: true,
                incomingCall: false,
                incomingCallNumber: '',
                callStatus: CallStatus.CONNECTED,
                callStartTime: Date.now(),
                ringingStartTime: null,
              }));
              console.log('Incoming call accepted:', sipRefs.invitationRef.current);
            } else if (state === SessionState.Terminated) {
              console.log('Call terminated with reason:', invitation);
              if (!sipRefs.sessionRef.current || sipRefs.sessionRef.current.state !== SessionState.Established) {
                cleanupSession();
              }
            }
          });
        },
      };

      userAgent.transport.onConnect = async () => {
        console.log('Transport connected');
        try {
          const registerer = new Registerer(userAgent, {
            expires: 10, //tempo de registro
            extraHeaders: ['X-oauth-dazsoft: 1'],
            regId: 1,
          });

          sipRefs.registererRef.current = registerer;

          registerer.stateChange.addListener((newState: RegistererState) => {
            console.log('Registerer state changed:', newState);
            switch (newState) {
              case RegistererState.Registered:
                setCallState((prev) => ({
                  ...prev,
                  isRegistered: true,
                  isRegistering: false,
                }));
                requestMediaPermissions();
                break;
              case RegistererState.Unregistered:
              case RegistererState.Terminated:
                setCallState((prev) => ({
                  ...prev,
                  isRegistered: false,
                  isRegistering: false,
                }));
                cleanupSession();
                break;
            }
          });

          await registerer.register();
          console.log('Registration request sent');

          // Set interval to renew registration
          sipRefs.registerIntervalRef.current = window.setInterval(() => {
            if (sipRefs.registererRef.current) {
              sipRefs.registererRef.current.register().catch((error) => {
                console.error('Error renewing registration:', error);
              });
            }
          }, 270000); // Renew registration every 4.5 minutes (270000 ms) // it was 20000
        } catch (error) {
          console.error('Registration error:', error);
          setCallState((prev) => ({
            ...prev,
            isRegistered: false,
            isRegistering: false,
          }));
        }
      };

      userAgent.transport.onDisconnect = (error?: Error) => {
        console.log('Transport disconnected', error);
        setCallState((prev) => ({
          ...prev,
          isRegistered: false,
          isRegistering: false,
        }));
        cleanupSession();
      };

      await userAgent.start();
      console.log('UserAgent started');
    } catch (error) {
      console.error('SIP initialization error:', error);
      setCallState((prev) => ({
        ...prev,
        isRegistered: false,
        isRegistering: false,
      }));
    }
  };

  const sendDTMF = (tone: string) => {
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
    dtmfSender.insertDTMF(tone, 100);
  };

  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Media permissions granted');
    } catch (error) {
      console.error('Media permissions error:', error);
    }
  };

  const handleCall = async () => {
    if (!callState.currentNumber || !sipRefs.userAgentRef.current || callState.isInCall)
      return;

    setIsKeyboardExpanded(false);

    try {
      await cleanupSession();
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.STARTING_CALL,
        ringingStartTime: Date.now(),
      }));

      const target = UserAgent.makeURI(
        `sip:${callState.currentNumber}@${config?.domain}`,
      );
      if (!target) {
        throw new Error('Failed to create target URI');
      }

      const inviter = new Inviter(sipRefs.userAgentRef.current, target, {
        extraHeaders: ['X-oauth-dazsoft: 1'],
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
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
  };

  const handleAcceptCall = async () => {
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
          constraints: {
            audio: true,
            video: false,
          },
        },
      });

      setupRemoteMedia(sipRefs.invitationRef.current);
      console.log('Incoming call accepted:', sipRefs.invitationRef.current);
    } catch (error) {
      console.error('Error accepting call:', error);
      await cleanupSession();
    }
  };

  const handleRejectCall = async () => {
    if (!sipRefs.invitationRef.current) return;

    try {
      sipRefs.invitationRef.current.reject();
    } catch (error) {
      console.error('Error rejecting call:', error);
    } finally {
      await cleanupSession();
    }
  };

  const handleMute = () => {
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
          audioTrack.track.enabled = callState.isMuted;
          setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const transferCall = (to: string) => {
    const sessionManager = new SessionManager(
      'wss://webrtc.dazsoft.com:8080/ws',
      { registererOptions: { extraHeaders: ['X-oauth-dazsoft: 1'] } },
    );

    if (sipRefs.sessionRef.current)
      sessionManager?.transfer(
        sipRefs.sessionRef.current,
        `sip:${to}@suite.pabx.digital`,
      );
  };

  const handleKeyboardClick = (key: string) => {
    setCallState((prev) => ({
      ...prev,
      currentNumber: prev.currentNumber + key,
    }));
  };

  const IconPhoneOutgoing = getIcon('IconPhoneOutgoing');
  const IconMicrophoneOff = getIcon('IconMicrophoneOff');


  const theme = useTheme();

  const handleSendDtmf = (key: string) => {
    if (sipRefs.sessionRef.current?.state === SessionState.Established) {
      const keyTrimmedLastChar = key.trim()[key.length - 1];

      console.log('Sending DTMF tone from app:', keyTrimmedLastChar);
      setDtmf(dtmf + keyTrimmedLastChar);
      sendDTMF(keyTrimmedLastChar);
    }
  };

  const handleOpenAudioDevicesModal = () => {
    const modalId = 'audio-devices-modal';
    openModal(modalId);
  };

  // TODO: montar modo mais eficiente para verificar se o telephonyExtension está disponível
  if (!telephonyExtension) {
    return <></>;
  }

  return (
    <>
      <Draggable
        enableUserSelectHack={true}
        bounds="parent"
        onStart={(e) => {
          // Prevent the dragSelect from triggering
          e.stopPropagation();
        }}
      >
        <StyledContainer
          status={
            callState.isRegistered
              ? SoftphoneStatus.Online
              : callState.isRegistering
                ? SoftphoneStatus.Registering
                : SoftphoneStatus.Offline
          }
          data-select-disable="true"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
          }}
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute',
            bottom: '80px',
            right: '40px'
          }}
        >
        <audio ref={sipRefs.remoteAudioRef} autoPlay />

        {callState.incomingCall && !callState.isInCall ? (

          <IncomingCallHeader />

        ) : (

          <StyledStatusAndTimer>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusIndicator
                status={
                  callState.isRegistered
                    ? SoftphoneStatus.Online
                    : callState.isRegistering
                      ? SoftphoneStatus.Registering
                      : SoftphoneStatus.Offline
                }
                extension={config?.username}
              />
              <StyledSettingsButton onClick={handleOpenAudioDevicesModal}>
                <IconSettings size={theme.icon.size.md} />
              </StyledSettingsButton>
            </div>
            
            {(callState.isInCall || callState.ringingStartTime) && (
              <StyledIncomingTimerAndIcon>
                <IconPhoneOutgoing
                  color={theme.font.color.secondary}
                  size={theme.icon.size.md}
                />
                <StyledIncomingText>
                  {callState.callStartTime ? elapsedTime : ringingTime}
                </StyledIncomingText>
              </StyledIncomingTimerAndIcon>
            )}
          </StyledStatusAndTimer>
        )}

        <StyledControlsContainer
          column={callState.incomingCall && !callState.isInCall}
        >
            {callState.incomingCall && !callState.isInCall ? (
              <IncomingCallBody
                incomingCallNumber={callState.incomingCallNumber}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
              />
            ) : (

            <div style={{ width: '100%' }}>
              <StyledDefaultContainer>
                <StyledTextAndCallButton>
                  
                  {!callState.isInCall && !callState.callStatus && (
                    <TextInput
                      placeholder={t`Dial the phone number`}
                      fullWidth
                      value={callState.currentNumber}
                      onChange={(e) => {
                        if (!callState.isInCall) {
                          setCallState((prev) => ({
                            ...prev,
                            currentNumber: e.replace(/\D/g, ''),
                          }));
                        }
                      }}
                      RightIcon={() => (
                        <KeyboardToggleButton
                          isExpanded={isKeyboardExpanded}
                          onToggle={() => setIsKeyboardExpanded(!isKeyboardExpanded)}
                        />
                      )}
                      disabled={callState.isInCall}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && callState.isRegistered) {
                          handleCall();
                        }
                      }}
                    />
                  )}

                  {callState.isRegistered &&
                    !callState.isInCall &&
                    !callState.callStatus &&
                    !isKeyboardExpanded && (
                      <IconPhone
                        onClick={handleCall}
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.sm}
                        color={theme.color.gray30}
                        style={{
                          cursor: 'pointer',
                          padding: theme.spacing(1),
                          borderRadius: '50%',
                          backgroundColor: theme.color.green60,
                        }}
                      />
                    )}

                  {isSendingDTMF && (
                    <TextInput
                      placeholder={t`Dial the phone number`}
                      fullWidth
                      value={dtmf}
                      onChange={(e) => {
                        handleSendDtmf(e);
                      }}
                      RightIcon={() => (
                        <KeyboardToggleButton
                          isExpanded={isKeyboardExpanded}
                          onToggle={() => setIsKeyboardExpanded(!isKeyboardExpanded)}
                        />
                      )}
                    />
                  )}

                  {isSendingDTMF && !isKeyboardExpanded && (
                    <IconArrowLeft
                      onClick={() => {
                        setIsSendingDTMF(false);
                        setIsKeyboardExpanded(false);
                      }}
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                      color={theme.color.gray30}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(1),
                        borderRadius: '50%',
                        backgroundColor: theme.color.red60,
                      }}
                    />
                  )}
                </StyledTextAndCallButton>

                <Keyboard
                  isVisible={isKeyboardExpanded}
                  onClick={
                    !isSendingDTMF ? handleKeyboardClick : handleSendDtmf
                  }
                />

                {callState.isRegistered &&
                  !callState.isInCall &&
                  !callState.callStatus &&
                  isKeyboardExpanded && (
                    <IconPhone
                      onClick={handleCall}
                      size={theme.icon.size.lg}
                      stroke={theme.icon.stroke.sm}
                      color={theme.color.gray30}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(5),
                        borderRadius: '50%',
                        backgroundColor: theme.color.green60,
                      }}
                    />
                  )}

                {isSendingDTMF && isKeyboardExpanded && (
                  <IconArrowLeft
                    onClick={() => {
                      setIsSendingDTMF(false);
                      setIsKeyboardExpanded(false);
                    }}
                    size={theme.icon.size.lg}
                    stroke={theme.icon.stroke.sm}
                    color={theme.color.gray30}
                    style={{
                      cursor: 'pointer',
                      padding: theme.spacing(5),
                      borderRadius: '50%',
                      backgroundColor: theme.color.red60,
                    }}
                  />
                )}
              </StyledDefaultContainer>

              {/* callState.isInCall */}
              {callState.isInCall && !isSendingDTMF && (
                <StyledOngoingCallContainer>
                  <StyledIncomingNumber alignSelf="center">
                    {callState.currentNumber}
                  </StyledIncomingNumber>

                  <StyledControlsContainer column={false} gap={5}>
                    <HoldButton
                      session={sipRefs.sessionRef.current}
                      isOnHold={callState.isOnHold}
                      setCallState={setCallState}
                      callState={callState}
                    />

                    <div
                      onClick={handleMute}
                      style={{
                        cursor: 'pointer',
                        padding: theme.spacing(3),
                        borderRadius: '50%',
                        // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
                        border: `1px solid #fff`,
                        backgroundColor: callState.isMuted
                          ? theme.background.overlaySecondary
                          : theme.background.tertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconMicrophoneOff
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.sm}
                        color={theme.font.color.secondary}
                      />
                    </div>

                    <TransferButton
                      session={sipRefs.sessionRef.current}
                      type="attended"
                      sendDTMF={transferCall}
                    />

                    <DTMFButton setIsSendingDTMF={setIsSendingDTMF} />
                  </StyledControlsContainer>

                  <StyledEndButton onClick={cleanupSession}>
                    {t`End call`}
                  </StyledEndButton>
                </StyledOngoingCallContainer>
              )}

              {(callState.callStatus === CallStatus.CALLING ||
                callState.callStatus === CallStatus.STARTING_CALL) && (
                <StyledEndButton onClick={cleanupSession}>
                  {t`End call`}
                </StyledEndButton>
              )}
            </div>
          )}
        </StyledControlsContainer>
        </StyledContainer>
      </Draggable>
      
      <AudioDevicesModal modalId="audio-devices-modal" />
    </>
  );
};

export default WebSoftphone;
