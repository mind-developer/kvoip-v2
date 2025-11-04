/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-console */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGetUserSoftfone } from '@/settings/service-center/telephony/hooks/useGetUserSoftfone';
import DTMFButton from '@/softphone-old/components/DTMFButton';
import Keyboard from '@/softphone-old/components/Keyboard';
import StatusIndicator from '@/softphone-old/components/StatusPill';
import { TextInput } from '@/ui/input/components/TextInput';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useRecoilValue } from 'recoil';
import {
  Invitation,
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  UserAgent,
} from 'sip.js';
import {
  SessionDescriptionHandler,
  SessionManager,
} from 'sip.js/lib/platform/web';
import { IconArrowLeft, IconPhone, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import defaultCallState from '../constants/defaultCallState';
import { useRingTone } from '../hooks/useRingTone';
import { CallState } from '../types/callState';
import { CallStatus } from '../types/callStatusEnum';
import { SipConfig } from '../types/sipConfig';
import formatTime from '../utils/formatTime';
import generateAuthorizationHa1 from '../utils/generateAuthorizationHa1';
import HoldButton from './HoldButton';
import TransferButton from './TransferButton';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(3)};
  width: 300px;
  position: relative;
  cursor: grab;
  gap: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledControlsContainer = styled.div<{ column?: boolean; gap?: number }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  gap: ${({ theme, gap }) => theme.spacing(gap || 1)};
`;

const StyledIncomingCall = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledIncomingButton = styled.div<{ accept: boolean }>`
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ accept, theme }) =>
    accept ? theme.color.green60 : theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background-color: ${({ accept, theme }) =>
      accept ? theme.color.green70 : theme.color.red50};
  }
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

const StyledIncomingButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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

const WebSoftphone: React.FC = () => {
  const [config, setConfig] = useState<SipConfig>();
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [ringingTime, setRingingTime] = useState<string>('00:00');
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userAgentRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const invitationRef = useRef<Invitation | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const registerIntervalRef = useRef<number>();
  const holdAudioRef = useRef<HTMLAudioElement>(
    new Audio('https://kvoip.com.br/musicadeespera.mp3'),
  );

  useRingTone(isRinging, isIncomingCall);

  const { getIcon } = useIcons();

  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const workspaceMember = workspaceMembers.find(
    (member: WorkspaceMember) => member.id === currentWorkspaceMember?.id,
  );

  // const { telephonyExtensions, loading } = useFindAllPABX();
  const { telephonyExtension } = useGetUserSoftfone({
    extNum: workspaceMember?.extensionNumber ?? "1000",
  });

  useEffect(() => {
    if (telephonyExtension) {
      setConfig({
        domain: 'suite.pabx.digital',
        proxy: 'webrtc.dazsoft.com:8080',
        protocol: 'wss://',
        authorizationHa1: '',
        username: telephonyExtension.usuario_autenticacao,
        password: telephonyExtension.senha_sip,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephonyExtension]);

  useEffect(() => {
    if (
      config?.username &&
      config?.password &&
      config?.domain &&
      telephonyExtension
    ) {
      updateConfigWithHa1();
    }
    return () => {
      onComponentUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.username, config?.password, config?.domain, telephonyExtension]);

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
    () => startTimer(callState.callStartTime, setElapsedTime, timerRef),
    [callState.callStartTime],
  );

  useEffect(
    () =>
      startTimer(callState.ringingStartTime, setRingingTime, ringingTimerRef),
    [callState.ringingStartTime],
  );

  useEffect(() => {
    setIsRinging(callState.callStatus === CallStatus.CALLING);
  }, [callState.callStatus]);

  useEffect(() => {
    setIsIncomingCall(callState.incomingCall);
  }, [callState.incomingCall]);

  useEffect(() => {
    if (holdAudioRef.current) {
      holdAudioRef.current.load();
    }
  }, []);

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
    if (sessionRef.current) {
      try {
        if (sessionRef.current.state === SessionState.Established) {
          await sessionRef.current.bye();
        } else if (sessionRef.current.state === SessionState.Establishing) {
          if (sessionRef.current instanceof Inviter)
            await sessionRef.current.cancel();
        }
      } catch (error) {
        console.error('Error cleaning up session:', error);
      }
      sessionRef.current = null;
    }
    if (invitationRef.current) {
      try {
        if (invitationRef.current.state !== SessionState.Terminated) {
          await invitationRef.current.reject();
        }
      } catch (error) {
        console.error('Error rejecting invitation:', error);
      }
      invitationRef.current = null;
    }

    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (ringingTimerRef.current) {
      clearInterval(ringingTimerRef.current);
    }

    // Stop hold music
    if (holdAudioRef.current) {
      holdAudioRef.current.pause();
      holdAudioRef.current.currentTime = 0;
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

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const onComponentUnmount = async () => {
    await cleanupSession();
    if (registererRef.current) {
      registererRef.current.unregister();
    }
    if (userAgentRef.current) {
      userAgentRef.current.stop();
    }
    if (registerIntervalRef.current) {
      clearInterval(registerIntervalRef.current);
    }
  };

  const setupRemoteMedia = (session: Session) => {
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

    if (remoteAudioRef.current) {
      const remoteStream = new MediaStream();
      peerConnection.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) {
          remoteStream.addTrack(receiver.track);
        }
      });
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((error) => {
        console.error('Error playing remote audio:', error);
      });

      // Verifica se o canal de DTMF está disponível
      const dtmfSender = peerConnection
        .getSenders()
        .find((sender) => sender.track?.kind === 'audio')?.dtmf;
      if (!dtmfSender) {
        console.error('DTMF sender not available');
      } else {
        console.log('✅ DTMF sender encontrado:', {
          canInsertDTMF: dtmfSender.canInsertDTMF,
          toneBuffer: dtmfSender.toneBuffer
        });
      }
    }

    // Aguardar um pouco e verificar novamente o DTMF
    setTimeout(() => {
      console.log('🔍 Verificando DTMF após setup...');
      debugDTMFConfiguration();
    }, 1000);
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
              if (description.sdp) {
                console.log('🔧 Modificando SDP para DTMF...');
                console.log('📄 SDP Original:', description.sdp);
                
                try {
                  let sdp = description.sdp;

                  // 1) Garantir que o payload 101 esteja listado na linha m=audio PRIMEIRO
                  sdp = sdp.replace(/^(m=audio [^\r\n]+)/m, (line) => {
                    if (/\s101(\s|$)/.test(line)) {
                      console.log('✅ Payload 101 já presente na linha m=audio:', line);
                      return line;
                    } else {
                      console.log('✅ Adicionando payload 101 na linha m=audio:', line);
                      return `${line} 101`;
                    }
                  });

                  // 2) Garantir rtpmap e fmtp para telephone-event (payload 101)
                  // Encontrar a seção de mídia e adicionar após os atributos existentes
                  if (!sdp.includes('a=rtpmap:101 telephone-event/8000')) {
                    // Procurar por uma linha a=rtpmap existente para inserir após ela
                    const rtpmapRegex = /(a=rtpmap:\d+ [^\r\n]+)/g;
                    const rtpmapMatches = [...sdp.matchAll(rtpmapRegex)];
                    
                    if (rtpmapMatches.length > 0) {
                      // Inserir após a última linha a=rtpmap
                      const lastMatch = rtpmapMatches[rtpmapMatches.length - 1];
                      const insertPoint = lastMatch.index! + lastMatch[0].length;
                      sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                      console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após:', lastMatch[0]);
                    } else {
                      // Se não há a=rtpmap, adicionar após a linha m=audio
                      const mAudioMatch = sdp.match(/^(m=audio [^\r\n]+)/m);
                      if (mAudioMatch) {
                        const insertPoint = mAudioMatch.index! + mAudioMatch[0].length;
                        sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                        console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após m=audio');
                      }
                    }
                  } else {
                    console.log('✅ rtpmap:101 telephone-event/8000 já existe');
                  }
                  
                  if (!sdp.includes('a=fmtp:101')) {
                    // Adicionar fmtp após o rtpmap:101
                    const rtpmap101Match = sdp.match(/a=rtpmap:101 telephone-event\/8000/);
                    if (rtpmap101Match) {
                      const insertPoint = rtpmap101Match.index! + rtpmap101Match[0].length;
                      sdp = sdp.slice(0, insertPoint) + '\r\na=fmtp:101 0-15' + sdp.slice(insertPoint);
                      console.log('✅ Adicionado fmtp:101 0-15 após rtpmap:101');
                    } else {
                      sdp += '\r\na=fmtp:101 0-15';
                      console.log('✅ Adicionado fmtp:101 0-15 no final');
                    }
                  } else {
                    console.log('✅ fmtp:101 0-15 já existe');
                  }

                  description.sdp = sdp;
                  console.log('📄 SDP Modificado:', description.sdp);
                  console.log('🔧 SDP modificado com sucesso para DTMF');
                } catch (error) {
                  console.error('❌ Erro ao modificar SDP:', error);
                  console.log('📄 SDP Original mantido:', description.sdp);
                }
              }
              return Promise.resolve(description);
            },
          ],
        },
      });

      // Manter o UserAgent na referência
      userAgentRef.current = userAgent;

      // // Enviar pacotes OPTIONS a cada 30 segundos
      // setInterval(() => {
      //   // const optionsRequest = new Request('OPTIONS', {
      //   //   to: uri,
      //   //   from: uri,
      //   //   headers: {
      //   //     to: { uri: uri },
      //   //     from: { uri: uri },
      //   //     'max-forwards': 70,
      //   //   },
      //   // }); ISSO NAO FAZ SENTIDO MAS TA FUNCIONANDO.
      //   try {
      //     userAgent.transport.send('aa');
      //   } catch (err) {
      //     console.error('Error sending OPTIONS packet:', err);
      //   }
      //   console.log('Pacote OPTIONS enviado para manter a conexão ativa.');
      // }, 30000); // Intervalo de 30 segundos

      // Evento para encerrar a conexão quando a página for fechada ou recarregada
      window.addEventListener('beforeunload', () => {
        if (userAgentRef.current) {
          userAgentRef.current.stop(); // Encerra a conexão SIP
          console.warn('Conexão SIP encerrada.');
        }
      });

      userAgent.delegate = {
        onInvite: (invitation) => {
          // Don't clean up the session for incoming calls - this prevents race conditions
          // We'll only clean up if there's already an active call
          if (sessionRef.current || invitationRef.current) {
            cleanupSession();
          }

          invitationRef.current = invitation;
          const fromNumber = invitation.remoteIdentity.uri.user;
          setCallState((prev) => ({
            ...prev,
            incomingCall: true,
            incomingCallNumber: fromNumber || '',
            ringingStartTime: Date.now(),
            callStatus: CallStatus.INCOMING_CALL,
          }));

          invitation.stateChange.addListener((state: SessionState) => {
            if (state === SessionState.Establishing) {
              setCallState((prev) => ({
                ...prev,
                callStatus: CallStatus.CONNECTING,
              }));
            } else if (state === SessionState.Established) {
              sessionRef.current = invitation;
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
            } else if (state === SessionState.Terminated) {
              cleanupSession();
            }
          });
        },
      };

      userAgent.transport.onConnect = async () => {
        try {
          const registerer = new Registerer(userAgent, {
            expires: 10, //tempo de registro
            extraHeaders: ['X-oauth-dazsoft: 1'],
            regId: 1,
          });

          registererRef.current = registerer;

          registerer.stateChange.addListener((newState: RegistererState) => {
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

          // Set interval to renew registration
          registerIntervalRef.current = window.setInterval(() => {
            if (registererRef.current) {
              registererRef.current.register().catch((error) => {
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
        setCallState((prev) => ({
          ...prev,
          isRegistered: false,
          isRegistering: false,
        }));
        cleanupSession();
      };

      await userAgent.start();
    } catch (error) {
      console.error('SIP initialization error:', error);
      setCallState((prev) => ({
        ...prev,
        isRegistered: false,
        isRegistering: false,
      }));
    }
  };

  const sendDTMF = async (tone: string) => {
    if (
      !sessionRef.current ||
      sessionRef.current.state !== SessionState.Established
    ) {
      console.log('Não é possível enviar DTMF: chamada não está ativa');
      return;
    }

    const sessionDescriptionHandler = sessionRef.current
      .sessionDescriptionHandler as SessionDescriptionHandler | undefined;
    
    if (!sessionDescriptionHandler) {
      console.error('Session description handler não encontrado');
      return;
    }

    // Método direto: usar insertDTMF no RTCDTMFSender
    console.log('🎯 Tentando enviar DTMF diretamente via RTCDTMFSender...');
    
    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.error('❌ PeerConnection não disponível');
      return;
    }

    const audioSenders = peerConnection.getSenders().filter(sender => sender.track?.kind === 'audio');
    console.log(`📊 Audio senders encontrados: ${audioSenders.length}`);
    
    for (let i = 0; i < audioSenders.length; i++) {
      const sender = audioSenders[i];
      console.log(`🔍 Verificando sender ${i}:`, {
        hasDTMF: !!sender.dtmf,
        canInsertDTMF: sender.dtmf?.canInsertDTMF,
        trackEnabled: sender.track?.enabled
      });

      if (sender.dtmf) {
        try {
          console.log(`🎯 Tentando insertDTMF no sender ${i}...`);
          sender.dtmf.insertDTMF(tone, 200, 70);
          console.log(`✅ DTMF enviado com sucesso via sender ${i}: ${tone}`);
          return; // Sucesso, sair da função
        } catch (error) {
          console.error(`❌ Erro no sender ${i}:`, error);
          // Continuar para o próximo sender
        }
      }
    }

    // Se chegou aqui, nenhum sender funcionou
    console.log('❌ Nenhum sender de DTMF funcionou - tentando criar novo sender...');
    
    // Tentar criar um novo sender com DTMF
    try {
      console.log('🔄 Tentando criar novo sender com DTMF...');
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Adicionar o stream ao peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
      
      console.log('✅ Novo sender criado, verificando DTMF...');
      
      // Aguardar um pouco e verificar novamente
      setTimeout(() => {
        console.log('🔍 Verificando DTMF após criação de novo sender...');
        sendDTMF(tone); // Tentar novamente
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao criar novo sender:', error);
      debugDTMFConfiguration();
    }
  };

  // Função para tentar forçar a criação do DTMF sender
  const forceDTMFSenderCreation = async () => {
    if (!sessionRef.current) return;

    const sessionDescriptionHandler = sessionRef.current
      .sessionDescriptionHandler as SessionDescriptionHandler | undefined;
    
    if (!sessionDescriptionHandler || !('peerConnection' in sessionDescriptionHandler)) {
      console.log('❌ Não é possível forçar DTMF: SessionDescriptionHandler não encontrado');
      return;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.log('❌ Não é possível forçar DTMF: PeerConnection não disponível');
      return;
    }

    try {
      // Tentar criar um novo sender com DTMF
      const audioSenders = peerConnection.getSenders().filter(sender => sender.track?.kind === 'audio');
      
      if (audioSenders.length > 0) {
        const audioSender = audioSenders[0];
        console.log('🔧 Audio sender encontrado:', {
          track: audioSender.track?.kind,
          enabled: audioSender.track?.enabled,
          hasDTMF: !!audioSender.dtmf
        });

        // Verificar se o track está habilitado
        if (audioSender.track && !audioSender.track.enabled) {
          console.log('🔧 Habilitando track de áudio...');
          audioSender.track.enabled = true;
        }

        // Aguardar um pouco e verificar novamente
        setTimeout(() => {
          console.log('🔍 Verificando DTMF após tentativa de correção...');
          debugDTMFConfiguration();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro ao tentar forçar DTMF sender:', error);
    }
  };


  // Função para verificar se DTMF está disponível
  const isDTMFAvailable = (): boolean => {
    if (!sessionRef.current || sessionRef.current.state !== SessionState.Established) {
      console.log('❌ Session não está estabelecida');
      return false;
    }

    const sessionDescriptionHandler = sessionRef.current
      .sessionDescriptionHandler as SessionDescriptionHandler | undefined;
    
    if (!sessionDescriptionHandler || !('peerConnection' in sessionDescriptionHandler)) {
      console.log('❌ SessionDescriptionHandler não encontrado');
      return false;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.log('❌ PeerConnection não disponível');
      return false;
    }

    const audioSenders = peerConnection.getSenders().filter(sender => sender.track?.kind === 'audio');
    console.log(`📊 Audio senders encontrados: ${audioSenders.length}`);
    
    const dtmfSender = audioSenders.find(sender => sender.dtmf)?.dtmf;
    
    if (!dtmfSender) {
      console.log('❌ DTMF sender não encontrado');
      return false;
    }

    const canInsert = dtmfSender.canInsertDTMF;
    console.log(`📊 DTMF canInsertDTMF: ${canInsert}`);
    
    return canInsert;
  };

  // Função para debug da configuração DTMF
  const debugDTMFConfiguration = () => {
    if (!sessionRef.current) return;

    const sessionDescriptionHandler = sessionRef.current
      .sessionDescriptionHandler as SessionDescriptionHandler | undefined;
    
    if (!sessionDescriptionHandler || !('peerConnection' in sessionDescriptionHandler)) {
      console.log('❌ Debug: SessionDescriptionHandler não encontrado');
      return;
    }

    const peerConnection = sessionDescriptionHandler.peerConnection;
    if (!peerConnection) {
      console.log('❌ Debug: PeerConnection não disponível');
      return;
    }

    console.log('🔍 === DEBUG DTMF CONFIGURATION ===');
    
    // Verificar senders de áudio
    const senders = peerConnection.getSenders();
    console.log(`📊 Total senders: ${senders.length}`);
    
    senders.forEach((sender, index) => {
      console.log(`📊 Sender ${index}:`, {
        kind: sender.track?.kind,
        enabled: sender.track?.enabled,
        hasDTMF: !!sender.dtmf,
        canInsertDTMF: sender.dtmf?.canInsertDTMF
      });
    });

    // Verificar configuração SDP local
    if (peerConnection.localDescription) {
      const localSdp = peerConnection.localDescription.sdp;
      console.log('📊 SDP Local contém telephone-event:', localSdp.includes('telephone-event'));
      console.log('📊 SDP Local contém rtpmap:101:', localSdp.includes('rtpmap:101'));
      console.log('📊 SDP Local contém fmtp:101:', localSdp.includes('fmtp:101'));
    }

    // Verificar configuração SDP remoto
    if (peerConnection.remoteDescription) {
      const remoteSdp = peerConnection.remoteDescription.sdp;
      console.log('📊 SDP Remoto contém telephone-event:', remoteSdp.includes('telephone-event'));
      console.log('📊 SDP Remoto contém rtpmap:101:', remoteSdp.includes('rtpmap:101'));
      console.log('📊 SDP Remoto contém fmtp:101:', remoteSdp.includes('fmtp:101'));
    }

    console.log('🔍 === FIM DEBUG ===');
  };

  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Media permissions error:', error);
    }
  };

  const handleCall = async () => {
    if (!callState.currentNumber || !userAgentRef.current || callState.isInCall)
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

      const inviter = new Inviter(userAgentRef.current, target, {
        extraHeaders: ['X-oauth-dazsoft: 1'],
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
        sessionDescriptionHandlerModifiers: [
          (description: RTCSessionDescriptionInit) => {
            if (description.sdp) {
              console.log('🔧 Modificando SDP para DTMF (handleCall)...');
              try {
                let sdp = description.sdp;

                // 1) Garantir que o payload 101 esteja listado na linha m=audio PRIMEIRO
                sdp = sdp.replace(/^(m=audio [^\r\n]+)/m, (line) => {
                  if (/\s101(\s|$)/.test(line)) {
                    console.log('✅ Payload 101 já presente na linha m=audio:', line);
                    return line;
                  } else {
                    console.log('✅ Adicionando payload 101 na linha m=audio:', line);
                    return `${line} 101`;
                  }
                });

                // 2) Garantir rtpmap e fmtp para telephone-event (payload 101)
                if (!sdp.includes('a=rtpmap:101 telephone-event/8000')) {
                  const rtpmapRegex = /(a=rtpmap:\d+ [^\r\n]+)/g;
                  const rtpmapMatches = [...sdp.matchAll(rtpmapRegex)];
                  
                  if (rtpmapMatches.length > 0) {
                    const lastMatch = rtpmapMatches[rtpmapMatches.length - 1];
                    const insertPoint = lastMatch.index! + lastMatch[0].length;
                    sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                    console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após:', lastMatch[0]);
                  } else {
                    const mAudioMatch = sdp.match(/^(m=audio [^\r\n]+)/m);
                    if (mAudioMatch) {
                      const insertPoint = mAudioMatch.index! + mAudioMatch[0].length;
                      sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                      console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após m=audio');
                    }
                  }
                } else {
                  console.log('✅ rtpmap:101 telephone-event/8000 já existe');
                }
                
                if (!sdp.includes('a=fmtp:101')) {
                  const rtpmap101Match = sdp.match(/a=rtpmap:101 telephone-event\/8000/);
                  if (rtpmap101Match) {
                    const insertPoint = rtpmap101Match.index! + rtpmap101Match[0].length;
                    sdp = sdp.slice(0, insertPoint) + '\r\na=fmtp:101 0-15' + sdp.slice(insertPoint);
                    console.log('✅ Adicionado fmtp:101 0-15 após rtpmap:101');
                  } else {
                    sdp += '\r\na=fmtp:101 0-15';
                    console.log('✅ Adicionado fmtp:101 0-15 no final');
                  }
                } else {
                  console.log('✅ fmtp:101 0-15 já existe');
                }

                description.sdp = sdp;
                console.log('🔧 SDP modificado com sucesso para DTMF (handleCall)');
              } catch (error) {
                console.error('❌ Erro ao modificar SDP (handleCall):', error);
              }
            }
            return Promise.resolve(description);
          },
        ],
      });

      sessionRef.current = inviter;

      inviter.stateChange.addListener(async (state: SessionState) => {
        if (state === SessionState.Establishing) {
          setCallState((prev) => ({
            ...prev,
            callStatus: CallStatus.CALLING,
            ringingStartTime: prev.ringingStartTime || Date.now(),
          }));
        } else if (state === SessionState.Established) {
          sessionRef.current = inviter;
          setupRemoteMedia(inviter);
          setCallState((prev) => ({
            ...prev,
            isInCall: true,
            callStatus: CallStatus.CONNECTED,
            callStartTime: Date.now(),
            ringingStartTime: null,
          }));
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
    if (!invitationRef.current) {
      return;
    }

    try {
      setCallState((prev) => ({
        ...prev,
        callStatus: CallStatus.ACCEPTING_CALL,
        ringingStartTime: null,
        callStartTime: Date.now(),
      }));

      await invitationRef.current.accept({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
        sessionDescriptionHandlerModifiers: [
          (description: RTCSessionDescriptionInit) => {
            if (description.sdp) {
              console.log('🔧 Modificando SDP para DTMF (handleAcceptCall)...');
              try {
                let sdp = description.sdp;

                // 1) Garantir que o payload 101 esteja listado na linha m=audio PRIMEIRO
                sdp = sdp.replace(/^(m=audio [^\r\n]+)/m, (line) => {
                  if (/\s101(\s|$)/.test(line)) {
                    console.log('✅ Payload 101 já presente na linha m=audio:', line);
                    return line;
                  } else {
                    console.log('✅ Adicionando payload 101 na linha m=audio:', line);
                    return `${line} 101`;
                  }
                });

                // 2) Garantir rtpmap e fmtp para telephone-event (payload 101)
                if (!sdp.includes('a=rtpmap:101 telephone-event/8000')) {
                  const rtpmapRegex = /(a=rtpmap:\d+ [^\r\n]+)/g;
                  const rtpmapMatches = [...sdp.matchAll(rtpmapRegex)];
                  
                  if (rtpmapMatches.length > 0) {
                    const lastMatch = rtpmapMatches[rtpmapMatches.length - 1];
                    const insertPoint = lastMatch.index! + lastMatch[0].length;
                    sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                    console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após:', lastMatch[0]);
                  } else {
                    const mAudioMatch = sdp.match(/^(m=audio [^\r\n]+)/m);
                    if (mAudioMatch) {
                      const insertPoint = mAudioMatch.index! + mAudioMatch[0].length;
                      sdp = sdp.slice(0, insertPoint) + '\r\na=rtpmap:101 telephone-event/8000' + sdp.slice(insertPoint);
                      console.log('✅ Adicionado rtpmap:101 telephone-event/8000 após m=audio');
                    }
                  }
                } else {
                  console.log('✅ rtpmap:101 telephone-event/8000 já existe');
                }
                
                if (!sdp.includes('a=fmtp:101')) {
                  const rtpmap101Match = sdp.match(/a=rtpmap:101 telephone-event\/8000/);
                  if (rtpmap101Match) {
                    const insertPoint = rtpmap101Match.index! + rtpmap101Match[0].length;
                    sdp = sdp.slice(0, insertPoint) + '\r\na=fmtp:101 0-15' + sdp.slice(insertPoint);
                    console.log('✅ Adicionado fmtp:101 0-15 após rtpmap:101');
                  } else {
                    sdp += '\r\na=fmtp:101 0-15';
                    console.log('✅ Adicionado fmtp:101 0-15 no final');
                  }
                } else {
                  console.log('✅ fmtp:101 0-15 já existe');
                }

                description.sdp = sdp;
                console.log('🔧 SDP modificado com sucesso para DTMF (handleAcceptCall)');
              } catch (error) {
                console.error('❌ Erro ao modificar SDP (handleAcceptCall):', error);
              }
            }
            return Promise.resolve(description);
          },
        ],
      });

      setupRemoteMedia(invitationRef.current);
    } catch (error) {
      console.error('Error accepting call:', error);
      await cleanupSession();
    }
  };

  const handleRejectCall = async () => {
    if (!invitationRef.current) return;

    try {
      invitationRef.current.reject();
    } catch (error) {
      console.error('Error rejecting call:', error);
    } finally {
      await cleanupSession();
    }
  };

  const handleMute = () => {
    if (sessionRef.current?.state === SessionState.Established) {
      try {
        const audioTrack = (
          sessionRef.current.sessionDescriptionHandler as
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

    if (sessionRef.current)
      sessionManager?.transfer(
        sessionRef.current,
        `sip:${to}@suite.pabx.digital`,
      );
  };

  const handleKeyboardClick = (key: string) => {
    setCallState((prev) => ({
      ...prev,
      currentNumber: prev.currentNumber + key,
    }));
  };

  const KeyboardOffIcon = getIcon('IconKeyboardOff');
  const KeyboardIcon = getIcon('IconKeyboard');
  const PhoneIncoming = getIcon('IconPhoneIncoming');
  const IconPhoneOutgoing = getIcon('IconPhoneOutgoing');
  const IconMicrophoneOff = getIcon('IconMicrophoneOff');

  const [isSendingDTMF, setIsSendingDTMF] = useState(false);
  const [dtmf, setDtmf] = useState('');

  const theme = useTheme();

  const handleSendDtmf = (key: string) => {
    if (sessionRef.current?.state === SessionState.Established) {
      const keyTrimmedLastChar = key.trim()[key.length - 1];

      setDtmf(dtmf + keyTrimmedLastChar);
      sendDTMF(keyTrimmedLastChar);
    }
  };

  if (!telephonyExtension) {
    return <></>;
  }

  return (
    <Draggable
      enableUserSelectHack={true}
      onStart={(e) => {
        // Prevent the dragSelect from triggering
        e.stopPropagation();
      }}
    >
      <StyledContainer
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
        style={{ zIndex: 9999 }}
      >
        <audio ref={remoteAudioRef} autoPlay />

        {callState.incomingCall && !callState.isInCall ? (
          <StyledIncomingCall>
            <PhoneIncoming
              color={theme.font.color.secondary}
              size={theme.icon.size.md}
            />
            <StyledIncomingText>{t`incoming`}</StyledIncomingText>
          </StyledIncomingCall>
        ) : (
          <StyledStatusAndTimer>
            <StatusIndicator
              status={
                callState.isRegistered
                  ? 'online'
                  : callState.isRegistering
                    ? 'registering'
                    : 'offline'
              }
              extension={config?.username}
            />
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
            <>
              <StyledIncomingNumber>
                {callState.incomingCallNumber}
              </StyledIncomingNumber>
              <StyledIncomingButtonContainer>
                <StyledIncomingButton accept={false} onClick={handleRejectCall}>
                  {t`Reject`}
                </StyledIncomingButton>
                <StyledIncomingButton accept={true} onClick={handleAcceptCall}>
                  {t`Accept`}
                </StyledIncomingButton>
              </StyledIncomingButtonContainer>
            </>
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
                      RightIcon={() =>
                        isKeyboardExpanded ? (
                          <IconButton
                            Icon={() => (
                              <KeyboardOffIcon
                                color={theme.font.color.tertiary}
                                size={theme.icon.size.md}
                              />
                            )}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        ) : (
                          <IconButton
                            Icon={() => (
                              <KeyboardIcon
                                color={theme.font.color.tertiary}
                                size={theme.icon.size.md}
                              />
                            )}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        )
                      }
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
                      RightIcon={() =>
                        isKeyboardExpanded ? (
                          <IconButton
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                            Icon={() => (
                              <KeyboardOffIcon
                                color={theme.font.color.tertiary}
                                size={theme.icon.size.md}
                              />
                            )}
                          />
                        ) : (
                          <IconButton
                            Icon={() => (
                              <KeyboardIcon
                                color={theme.font.color.tertiary}
                                size={theme.icon.size.md}
                              />
                            )}
                            onClick={() =>
                              setIsKeyboardExpanded(!isKeyboardExpanded)
                            }
                          />
                        )
                      }
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

                {isKeyboardExpanded && (
                  <Keyboard
                    onClick={
                      !isSendingDTMF ? handleKeyboardClick : handleSendDtmf
                    }
                  />
                )}

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
                      session={sessionRef.current}
                      isOnHold={callState.isOnHold}
                      setCallState={setCallState}
                      callState={callState}
                    />
                    <IconButton
                      onClick={handleMute}
                      Icon={() => (
                        <IconMicrophoneOff
                          size={theme.icon.size.lg}
                          stroke={theme.icon.stroke.sm}
                          color={theme.font.color.secondary}
                          style={{
                            padding: theme.spacing(3),
                            borderRadius: '50%',
                            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
                            border: `1px solid #fff`,
                            backgroundColor: callState.isMuted
                              ? theme.background.overlaySecondary
                              : theme.background.tertiary,
                          }}
                        />
                      )}
                    />

                    <TransferButton
                      session={sessionRef.current}
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
  );
};

export default WebSoftphone;

// const setupUserAgent = (updatedConfig: SipConfig, uri: URI) => {
//   const wsServer = `${updatedConfig.protocol}${updatedConfig.proxy}`;

//   return new UserAgent({
//     uri,
//     userAgentString: 'RamalWeb/1.1.11', // Define o UserAgent
//     transportOptions: {
//       server: wsServer,
//       traceSip: true,
//       wsServers: [wsServer],
//     },
//     sipExtensionReplaces: 'Supported' as SIPExtension,
//     sipExtensionExtraSupported: ['path', 'gruu', '100rel'],
//     authorizationUsername: updatedConfig.username,
//     authorizationPassword: updatedConfig.password,
//     displayName: updatedConfig.username,
//     contactName: updatedConfig.username,
//     noAnswerTimeout: 60,
//     hackIpInContact: false,
//     logLevel: 'error',
//     logConnector: console.log,
//     sessionDescriptionHandlerFactoryOptions: {
//       constraints: {
//         audio: true,
//         video: false,
//       },
//       peerConnectionOptions: {
//         rtcConfiguration: {
//           iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
//         },
//       },
//       modifiers: [
//         (description: RTCSessionDescriptionInit) => {
//           description.sdp = description.sdp?.replace(
//             'a=rtpmap:101 telephone-event/8000',
//             'a=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-15',
//           );
//           return Promise.resolve(description);
//         },
//       ],
//     },
//   });
// };

// const keepConectionAlive = async (userAgent: UserAgent, uri: URI) => {
//   // Enviar pacotes OPTIONS a cada 30 segundos
//   setInterval(async () => {
//     if (!userAgent || !userAgent.transport) {
//       console.error('Erro: UserAgent ou transporte não está disponível.');
//       return;
//     }

//     try {
//       const optionsMessage = `OPTIONS sip:${uri} SIP/2.0
//       Via: SIP/2.0/WSS example.com;branch=z9hG4bK776asdhds
//       Max-Forwards: 70
//       To: <sip:${uri}>
//       From: <sip:${uri}>;tag=12345
//       Call-ID: ${Math.random().toString(36).slice(2, 12)}
//       CSeq: 1 OPTIONS
//       Content-Length: 0`;

//       await userAgent.transport.send(optionsMessage);
//       console.log('Pacote OPTIONS enviado para manter a conexão ativa.');
//     } catch (error) {
//       console.error('Erro ao enviar pacote OPTIONS:', error);
//     }
//   }, 30000); // A cada 30 segundos
// };

// const onInvite = async (invitation: Invitation) => {
//   console.log('Incoming call received');

//   await cleanupSession();

//   invitationRef.current = invitation;
//   const fromNumber = invitation.remoteIdentity.uri.user;
//   setCallState((prev) => ({
//     ...prev,
//     incomingCall: true,
//     incomingCallNumber: fromNumber || '',
//     ringingStartTime: Date.now(),
//     callStatus: CallStatus.INCOMING_CALL,
//   }));

//   invitation.stateChange.addListener(async (state: SessionState) => {
//     console.log('Incoming call state changed:', state);
//     if (state === SessionState.Establishing) {
//       setCallState((prev) => ({
//         ...prev,
//         callStatus: CallStatus.CONNECTING,
//       }));
//     } else if (state === SessionState.Established) {
//       sessionRef.current = invitation;
//       setupRemoteMedia(invitation);
//       setCallState((prev) => ({
//         ...prev,
//         isInCall: true,
//         incomingCall: false,
//         incomingCallNumber: '',
//         callStatus: CallStatus.CONNECTED,
//         callStartTime: Date.now(),
//         ringingStartTime: null,
//       }));
//       console.log('Incoming call accepted:', invitationRef.current);
//     } else if (state === SessionState.Terminated) {
//       await cleanupSession();
//     }
//   });
// };

// const onConnect = async (userAgent: UserAgent) => {
//   console.log('Transport connected');
//   try {
//     const registerer = new Registerer(userAgent, {
//       expires: 300, //tempo de registro
//       extraHeaders: ['X-oauth-dazsoft: 1'],
//       regId: 1,
//     });

//     registererRef.current = registerer;

//     registerer.stateChange.addListener(async (newState: RegistererState) => {
//       console.log('Registerer state changed:', newState);
//       switch (newState) {
//         case RegistererState.Registered:
//           setCallState((prev) => ({
//             ...prev,
//             isRegistered: true,
//             isRegistering: false,
//           }));
//           requestMediaPermissions();
//           break;
//         case RegistererState.Unregistered:
//         case RegistererState.Terminated:
//           setCallState((prev) => ({
//             ...prev,
//             isRegistered: false,
//             isRegistering: false,
//           }));
//           await cleanupSession();
//           break;
//       }
//     });

//     await registerer.register();
//     console.log('Registration request sent');

//     // Set interval to renew registration
//     registerIntervalRef.current = window.setInterval(() => {
//       if (registererRef.current) {
//         registererRef.current.register().catch((error) => {
//           console.error('Error renewing registration:', error);
//         });
//       }
//     }, 270000); // Renew registration every 4.5 minutes (270000 ms)
//   } catch (error) {
//     console.error('Registration error:', error);
//     setCallState((prev) => ({
//       ...prev,
//       isRegistered: false,
//       isRegistering: false,
//     }));
//   }
// };

// const onDisconnect = async (error?: Error) => {
//   console.log('Transport disconnected', error);
//   setCallState((prev) => ({
//     ...prev,
//     isRegistered: false,
//     isRegistering: false,
//   }));
//   await cleanupSession();
// };

// const sendDTMF = (tone: string) => {
//   console.log('Sending DTMF tone:', tone);
//   console.log(
//     'Comparacao',
//     sessionRef.current?.state,
//     ' x ',
//     SessionState.Established,
//   );
//   // sessionManager?.transfer(session, `sip:${transferTarget}@${domain}`);
//   console.log('Session ref', sessionRef.current);

//   if (sessionRef.current?.state === SessionState.Established) {
//     const dtmfSender = (
//       sessionRef.current.sessionDescriptionHandler as
//         | SessionDescriptionHandler
//         | undefined
//     )?.peerConnection
//       ?.getSenders()
//       .find((sender) => sender.track?.kind === 'audio')?.dtmf;

//     console.log('DtmfSender:', dtmfSender);
//     console.log(
//       'SessionDescriptionHandler:',
//       (
//         sessionRef.current.sessionDescriptionHandler as
//           | SessionDescriptionHandler
//           | undefined
//       )?.peerConnection?.getSenders(),
//     );

//     if (dtmfSender) {
//       console.log(`Sending DTMF: ${tone}`);
//       dtmfSender.insertDTMF(tone, 1000);
//     } else {
//       console.error('DTMF sender not available');
//     }
//   }
// };
