/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */

/* @kvoip-woulz proprietary */

import IncomingCallHeader from '@/softphone/components/dialer/IncomingCallHeader';
import { SoftphoneStatus } from '@/softphone/constants';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Registerer,
  RegistererState,
  SessionState,
  UserAgent
} from 'sip.js';
import { SessionManager } from 'sip.js/lib/platform/web';
import {
  CALL_TRANSFER_CONFIG,
  DTMF_KEYS,
  REGISTRATION_CONFIG,
  SESSION_CONFIG,
  SOFTPHONE_POSITION_CONFIG,
  USER_AGENT_CONFIG,
  WEBRTC_CONFIG
} from '../constants';
import defaultCallState from '../constants/defaultCallState';
import { useTelephonyUserData } from '../hooks/query/useTelephonyUserData';
import { useCallAudio } from '../hooks/useCallAudio';
import { useCallStates } from '../hooks/useCallStates';
import { useCallTimer } from '../hooks/useCallTimer';
import { useDialingTone } from '../hooks/useDialingTone';
import { useRingTone } from '../hooks/useRingTone';
import { useSipConfig } from '../hooks/useSipConfig';
import { useSipManager } from '../hooks/useSipManager';
import { useSipRefs } from '../hooks/useSipRefs';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import { createDtmfSdpModifier } from '../utils';
import generateAuthorizationHa1 from '../utils/generateAuthorizationHa1';
import { AudioManager } from './audio/AudioManager';
import { CallControls } from './call/CallControls';
import { CallTimer } from './call/CallTimer';
import AudioDevicesModal from './modal/AudioDevicesModal';
import TransferModal from './modal/TransferModal';
import { ConnectionStatus } from './status/ConnectionStatus';

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
  // gap: ${({ theme, gap }) => theme.spacing(gap || 1)};
`;

const WebSoftphone: React.FC = () => {
  // Estados locais
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(false);
  const [isSendingDTMF, setIsSendingDTMF] = useState(false);
  const [dtmf, setDtmf] = useState('');
  
  // Hooks customizados
  const { telephonyExtension } = useTelephonyUserData();
  const { config, setConfig } = useSipConfig(telephonyExtension);
  const { isRinging, isIncomingCall, isActiveCall } = useCallStates(callState);
  const sipRefs = useSipRefs();
  const { startTimer } = useCallTimer(callState);
  
  // Debug: verificar se as referências estão sendo criadas
  // console.log('sipRefs criadas:', sipRefs);
  
  // Hooks de gerenciamento
  const sipManager = useSipManager({ config, setCallState, sipRefs });
  
  // Hooks de UI
  const { openModal } = useModal();

  // Hooks de áudio
  useRingTone(isRinging, isIncomingCall);
  useDialingTone(isRinging, isActiveCall);
  useCallAudio(sipRefs.remoteAudioRef.current);

  // Estados para timers
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');

  // Efeito para gerenciar transição automática do teclado quando chamada é estabelecida
  useEffect(() => {
    if (callState.isInCall && isKeyboardExpanded && !isSendingDTMF) {
      // Quando uma chamada é estabelecida e o teclado está aberto,
      // automaticamente muda para modo DTMF
      setIsSendingDTMF(true);
    } else if (!callState.isInCall && isSendingDTMF) {
      // Quando a chamada termina, volta para o modo normal
      setIsSendingDTMF(false);
      setIsKeyboardExpanded(false);
    }
  }, [callState.isInCall, isKeyboardExpanded, isSendingDTMF]);

  useEffect(
    () => startTimer(callState.callStartTime, setElapsedTime, sipRefs.timerRef),
    [callState.callStartTime, startTimer, sipRefs.timerRef],
  );

  useEffect(
    () =>
      startTimer(callState.ringingStartTime, setRingingTime, sipRefs.ringingTimerRef),
    [callState.ringingStartTime, startTimer, sipRefs.ringingTimerRef],
  );

  const updateConfigWithHa1 = async () => {
    // console.log('updateConfigWithHa1 chamado com config:', config);
    const authorizationHa1 = await generateAuthorizationHa1(
      config?.username || '',
      config?.password || '',
      config?.domain || '',
    );
    const updatedConfig = {
      ...config,
      authorizationHa1,
    };
    // console.log('Config atualizada:', updatedConfig);
    setConfig(updatedConfig);
    initializeSIP(updatedConfig);
  };

  const onComponentUnmount = async () => {
    await sipManager.cleanupSession();
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

      // console.log('Initializing SIP connection...', { updatedConfig });
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
        userAgentString: USER_AGENT_CONFIG.USER_AGENT_STRING,
        transportOptions: {
          server: wsServer,
          traceSip: true,
          wsServers: [wsServer],
        },
        authorizationUsername: updatedConfig.username,
        authorizationPassword: updatedConfig.password,
        displayName: updatedConfig.username,
        contactName: updatedConfig.username,
        noAnswerTimeout: USER_AGENT_CONFIG.NO_ANSWER_TIMEOUT,
        hackIpInContact: USER_AGENT_CONFIG.HACK_IP_IN_CONTACT,
        logLevel: USER_AGENT_CONFIG.LOG_LEVEL,
        logConnector: console.log,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: SESSION_CONFIG.MEDIA_CONSTRAINTS,
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: WEBRTC_CONFIG.ICE_SERVERS,
            },
          },
          modifiers: [createDtmfSdpModifier()],
        },
      });

      // Manter o UserAgent na referência
      sipRefs.userAgentRef.current = userAgent;
      // console.log('UserAgent criado e salvo na referência:', sipRefs.userAgentRef.current);

      // Evento para encerrar a conexão quando a página for fechada ou recarregada
      window.addEventListener('beforeunload', () => {
        if (sipRefs.userAgentRef.current) {
          sipRefs.userAgentRef.current.stop();
          // console.log('Conexão SIP encerrada.');
        }
      });

      userAgent.delegate = {
        onInvite: (invitation) => {
          // console.log('Incoming call received');

          if (sipRefs.sessionRef.current || sipRefs.invitationRef.current) {
            // console.log('Session state:', sipRefs.sessionRef.current?.state);
            sipManager.cleanupSession();
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
              // console.log('Call cancelled by remote party');
              if (sipRefs.sessionRef.current && sipRefs.sessionRef.current.state !== SessionState.Established) {
                sipManager.cleanupSession();
              }
            }
          };

          invitation.stateChange.addListener((state: SessionState) => {
            // console.log('Incoming call state changed:', state);
            
            if (state === SessionState.Establishing) {
              setCallState((prev) => ({
                ...prev,
                callStatus: CallStatus.CONNECTING,
              }));
            } else if (state === SessionState.Established) {
              sipRefs.sessionRef.current = invitation;
              sipManager.setupRemoteMedia(invitation);
              setCallState((prev) => ({
                ...prev,
                isInCall: true,
                incomingCall: false,
                incomingCallNumber: '',
                callStatus: CallStatus.CONNECTED,
                callStartTime: Date.now(),
                ringingStartTime: null,
              }));
              // console.log('Incoming call accepted:', sipRefs.invitationRef.current);
            } else if (state === SessionState.Terminated) {
              // console.log('Call terminated with reason:', invitation);
              if (!sipRefs.sessionRef.current || sipRefs.sessionRef.current.state !== SessionState.Established) {
                sipManager.cleanupSession();
              }
            }
          });
        },
      };

      userAgent.transport.onConnect = async () => {
        // console.log('Transport connected');
        try {
          const registerer = new Registerer(userAgent, {
            expires: REGISTRATION_CONFIG.EXPIRES,
            extraHeaders: REGISTRATION_CONFIG.EXTRA_HEADERS,
            regId: REGISTRATION_CONFIG.REG_ID,
          });

          sipRefs.registererRef.current = registerer;

          registerer.stateChange.addListener((newState: RegistererState) => {
            // console.log('Registerer state changed:', newState);
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
                sipManager.cleanupSession();
                break;
            }
          });

          await registerer.register();
          // console.log('Registration request sent');

          // Set interval to renew registration
          sipRefs.registerIntervalRef.current = window.setInterval(() => {
            if (sipRefs.registererRef.current) {
              sipRefs.registererRef.current.register().catch((error) => {
                console.error('Error renewing registration:', error);
              });
            }
          }, REGISTRATION_CONFIG.RENEWAL_INTERVAL);
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
        // console.log('Transport disconnected', error);
        setCallState((prev) => ({
          ...prev,
          isRegistered: false,
          isRegistering: false,
        }));
        sipManager.cleanupSession();
      };

      await userAgent.start();
      // console.log('UserAgent started');
      // console.log('UserAgent na referência após start:', sipRefs.userAgentRef.current);
    } catch (error) {
      console.error('SIP initialization error:', error);
      setCallState((prev) => ({
        ...prev,
        isRegistered: false,
        isRegistering: false,
      }));
    }
  };

  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // console.log('Media permissions granted');
    } catch (error) {
      console.error('Media permissions error:', error);
    }
  };

  const handleKeyboardClick = (key: string) => {
    console.log('handleKeyboardClick chamado com key:', key);
    setCallState((prev) => ({
      ...prev,
      currentNumber: prev.currentNumber + key,
    }));
  };

  const handleSendDtmf = (key: string) => {
    console.log('handleSendDtmf chamado com key:', key);

    if (sipRefs.sessionRef.current?.state === SessionState.Established) {

      // Tratar backspace - apenas atualizar o estado sem enviar DTMF
      if (key === 'Backspace' || key === 'backspace') {
        setDtmf(prevDtmf => prevDtmf.slice(0, -1));
        return;
      }

      const keysAllowed = DTMF_KEYS;

      if (!keysAllowed.includes(key as any)) {
        return;
      }

      // Para outras teclas, adicionar ao dtmf e enviar DTMF
      const keyTrimmedLastChar = key.trim()[key.length - 1];

      console.log('Sending DTMF tone from app:', keyTrimmedLastChar);

      setDtmf(prevDtmf => prevDtmf + keyTrimmedLastChar);

      sipManager.sendDTMF(keyTrimmedLastChar);
    }
  };

  const transferCall = (to: string) => {
    // console.log('Transferindo chamada para:', to);
    const sessionManager = new SessionManager(
      CALL_TRANSFER_CONFIG.SERVER_URL,
      { registererOptions: CALL_TRANSFER_CONFIG.REGISTERER_OPTIONS },
    );

    if (sipRefs.sessionRef.current) {
      sessionManager?.transfer(
        sipRefs.sessionRef.current,
        `sip:${to}@${CALL_TRANSFER_CONFIG.TRANSFER_DOMAIN}`,
      );
    } else {
      console.error('Nenhuma sessão ativa para transferir');
    }
  };

  const handleOpenAudioDevicesModal = () => {
    const modalId = 'audio-devices-modal';
    openModal(modalId);
  };

  const handleOpenTransferModal = () => {
    const modalId = 'transfer-modal';
    openModal(modalId);
  };

  //handleOpenTransferModal();

  const getStatus = (callState: CallState): SoftphoneStatus => {
    if (callState.isRegistered) return SoftphoneStatus.Online;
    if (callState.isRegistering) return SoftphoneStatus.Registering;
    return SoftphoneStatus.Offline;
  };

  // Inicializar SIP quando config estiver disponível
  useEffect(() => {
    // console.log('useEffect de inicialização executado com config:', config);
    if (config?.username && config?.password && config?.domain) {
      console.log('Configuração válida, chamando updateConfigWithHa1');
      updateConfigWithHa1();
    } else {
      console.log('Configuração inválida:', {
        username: config?.username,
        password: config?.password,
        domain: config?.domain
      });
    }
    return () => {
      onComponentUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.username, config?.password, config?.domain]);

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
          e.stopPropagation();
        }}
      >
        <StyledContainer
          status={getStatus(callState)}
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
            bottom: SOFTPHONE_POSITION_CONFIG.BOTTOM,
            right: SOFTPHONE_POSITION_CONFIG.RIGHT
          }}
        >
          <AudioManager 
            callState={callState}
            remoteAudioRef={sipRefs.remoteAudioRef}
          />

          {callState.incomingCall && !callState.isInCall ? (
            <IncomingCallHeader />
          ) : (
            <>
              <ConnectionStatus
                status={getStatus(callState)}
                extension={config?.username}
                onOpenSettings={handleOpenAudioDevicesModal}
              />
              
              <CallTimer
                callState={callState}
                elapsedTime={elapsedTime}
                ringingTime={ringingTime}
              />
            </>
          )}

          <StyledControlsContainer
            column={callState.incomingCall && !callState.isInCall}
          >
            <CallControls
              callState={callState}
              isKeyboardExpanded={isKeyboardExpanded}
              isSendingDTMF={isSendingDTMF}
              dtmf={dtmf}
              currentNumber={callState.currentNumber}
              session={sipRefs.sessionRef.current}
              onCall={() => {
                // console.log('Tentando fazer chamada para:', callState.currentNumber);
                sipManager.handleCall(callState.currentNumber);
              }}
              onAccept={sipManager.handleAcceptCall}
              onReject={sipManager.handleRejectCall}
              onEnd={sipManager.cleanupSession}
              onMute={sipManager.handleMute}
              onKeyboardClick={handleKeyboardClick}
              onSendDtmf={handleSendDtmf}
              onToggleKeyboard={() => {
                if (callState.isInCall && !isSendingDTMF) {
                  // Se estiver em uma chamada e não estiver no modo DTMF,
                  // ativar o modo DTMF ao abrir o teclado
                  setIsSendingDTMF(true);
                  setIsKeyboardExpanded(true);
                } else if (callState.isInCall && isSendingDTMF) {
                  // Se estiver em uma chamada e no modo DTMF,
                  // apenas fechar o teclado
                  setIsKeyboardExpanded(!isKeyboardExpanded);
                } else {
                  // Para chamadas não estabelecidas, comportamento normal
                  setIsKeyboardExpanded(!isKeyboardExpanded);
                }
              }}
              onSetIsSendingDTMF={setIsSendingDTMF}
              onSetCurrentNumber={(number: string) => setCallState(prev => ({ ...prev, currentNumber: number }))}
              setCallState={setCallState}
              transferCall={transferCall}
              onOpenTransferModal={handleOpenTransferModal}
            />
          </StyledControlsContainer>
        </StyledContainer>
      </Draggable>
      
      <AudioDevicesModal modalId="audio-devices-modal" />
      <TransferModal 
        modalId="transfer-modal" 
        onTransfer={transferCall}
      />
    </>
  );
};

export default WebSoftphone;