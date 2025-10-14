/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ChatAnex } from '@/chat/call-center/components/ChatAnex';
import DocumentPreview from '@/chat/call-center/components/DocumentPreview';
import { PaneChatHeader } from '@/chat/call-center/components/PaneChatHeader';
import StyledAudio from '@/chat/call-center/components/StyledAudio';
import { AvatarComponent } from '@/chat/call-center/components/UserInfoChat';
import { MODAL_IMAGE_POPUP } from '@/chat/call-center/constants/MODAL_IMAGE_POPUP';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { useSendWhatsappMessages } from '@/chat/call-center/hooks/useSendWhatsappMessages';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import {
  getMessageContent,
  getMessageDisplayType,
} from '@/chat/call-center/utils/clientChatMessageHelpers';
import StyledImage from '@/chat/components/StyledImage';
import { StyledMessageBubble } from '@/chat/components/StyledMessageBubble';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { validVideoTypes } from '@/chat/types/FileTypes';
import { MessageType } from '@/chat/types/MessageType';
import { formatDate } from '@/chat/utils/formatDate';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconExclamationCircleFilled } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessage,
  ClientChatStatus,
} from 'twenty-shared/types';
import { IconPlayerPause, IconTrash, useIcons } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { useClientMessageSubscription } from '../hooks/useClientMessageSubscription';

const StyledPaneChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-top: 0;
  gap: ${({ theme }) => theme.spacing(0)};
  width: 100%;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'black' : theme.background.primary};
`;

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0)};
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  margin-inline: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledMessageContainer = styled.div<{ fromMe: boolean }>`
  display: flex;
  flex-direction: ${({ fromMe }) => (fromMe ? 'row-reverse' : 'row')};
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  border-radius: ${({ theme }) => theme.spacing(2)};
  transition: all 0.15s;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAvatarMessage = styled.div`
  z-index: 1;
  align-self: flex-end;
`;

const StyledMessageItem = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'flex-start'};
  justify-content: baseline;
  width: auto;
  max-width: 70%;
`;

const StyledNameAndTimeContainer = styled.div<{ isSystemMessage: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDateContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledDocumentContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocument = styled.a`
  color: ${({ theme }) => theme.font.color.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledMessage = styled.div<{ isSystemMessage: boolean }>`
  max-width: ${({ isSystemMessage }) => (isSystemMessage ? 'none' : '100%')};
  text-align: left;
`;

const StyledVideo = styled.video<{ isSystemMessage: boolean }>`
  display: block;
  margin-left: ${({ isSystemMessage }) => (isSystemMessage ? 'auto' : '0')};
  margin-right: ${({ isSystemMessage }) => (isSystemMessage ? '0' : 'auto')};
  max-height: 150px;
`;

const StyledLine = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

const StyledInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xxl};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
`;

const StyledInput = styled.textarea`
  /* width: 100%; */
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: ${({ theme }) => theme.font.size.md};
  font-family: ${({ theme }) => theme.font.family};
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 10px;
  max-height: 200px;
  &::placeholder {
    line-height: 10px;
  }
`;

const StyledDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3.5)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: 0;
`;

const StyledAnexDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
`;

const StyledImageContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: '5px';
  min-width: 24px;
  animation: swap 0.5s cubic-bezier(0, 1.06, 0.53, 0.99);
  @keyframes swap {
    0% {
      transform: translateY(5px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const StyledButton = styled(Button)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
  justify-content: center;
  width: 100%;
`;

const StyledMessageEvent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  padding-block: ${({ theme }) => theme.spacing(3)};
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledModalOverlay = styled(motion.div)`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 1000;
  animation: blur 0.3s ease-out;
  backdrop-filter: blur(20px);
  @keyframes blur {
    0% {
      backdrop-filter: blur(0px);
    }
    100% {
      backdrop-filter: blur(20px);
    }
  }
`;

const StyledModalImage = styled.img`
  max-width: 40%;
  max-height: 40dvh;
  object-fit: contain;
  ${MODAL_IMAGE_POPUP}
  border-radius: ${({ theme }) => theme.border.radius.md};
  transition: border-radius 0.3s;
  transition: transform cubic-bezier(0, 0.42, 0, 1.03) 0.3s;
  animation: zoom-in 800ms cubic-bezier(0, 0.42, 0, 1.03);
  &:hover {
    border-radius: 0;
    transform: scale(2);
  }
  @keyframes zoom-in {
    0% {
      transform: scale(0.95);
    }
    8% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StyledContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  justify-items: 'flex-end';
  justify-content: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'none'};
  align-items: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'none'};
  width: 100%;
`;

const StyledNewMessagesButton = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(24)};
  right: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.invertedPrimary};
  color: ${({ theme }) => theme.font.color.inverted};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  z-index: 2;
`;

const StyledAmplitudeValue = styled.div<{ amplitudeValue: number }>`
  width: 2px;
  margin-right: 1px;
  background-color: ${({ theme }) => theme.background.invertedPrimary};
  height: ${({ amplitudeValue }) =>
    Math.round(Math.min(60 * amplitudeValue + 3, 40))}px;
`;

const StyledUnreadMarker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.red};
  font-weight: bold;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: ${({ theme }) => theme.spacing(2)} 0;
  position: relative;

  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.color.red};
    margin-right: ${({ theme }) => theme.spacing(2)};
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.color.red};
    margin-left: ${({ theme }) => theme.spacing(2)};
  }

  user-select: none;
`;

export const PaneChat = () => {
  const { chatId } = useParams() || '';
  const { record: selectedChat } = useFindOneRecord({
    objectNameSingular: 'clientChat',
    objectRecordId: chatId,
    skip: !chatId,
  });

  const { startService, setStartChatNumber, setStartChatIntegrationId } =
    useContext(CallCenterContext) as CallCenterContextType;

  const [lastFromClient, setLastFromClient] =
    useState<ClientChatMessage | null>(null);

  const handleMessageCreated = useCallback((message: ClientChatMessage) => {
    console.log('Nova mensagem criada via subscription:', message);
    setDbMessages((prev) => [...prev, message]);
  }, []);

  const handleMessageUpdated = useCallback((message: ClientChatMessage) => {
    setDbMessages((prev) =>
      prev.map((msg) =>
        msg.providerMessageId === message.providerMessageId ? message : msg,
      ),
    );
  }, []);

  const handleSubscriptionError = useCallback((error: any) => {
    console.error('Erro na subscription de mensagem:', error);
  }, []);

  useClientMessageSubscription({
    input: { chatId: chatId! },
    onMessageCreated: handleMessageCreated,
    onMessageUpdated: handleMessageUpdated,
    onError: handleSubscriptionError,
    skip: !chatId,
  });

  const [dbMessages, setDbMessages] = useState<ClientChatMessage[]>([]);
  const { records: dbMessagesRecord } = useFindManyRecords<
    ClientChatMessage & { __typename: string; id: string }
  >({
    objectNameSingular: 'clientChatMessage',
    filter: chatId ? { clientChatId: { eq: chatId } } : undefined,
    skip: !chatId,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
  });
  useEffect(() => {
    if (dbMessagesRecord) {
      setDbMessages(dbMessagesRecord as ClientChatMessage[]);
    }
  }, [dbMessagesRecord]);

  const [newMessage, setNewMessage] = useState<string>('');
  const [isAnexOpen, setIsAnexOpen] = useState<boolean>(false);
  const theme = useTheme();
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const { t } = useLingui();
  const [recordingState, setRecordingState] = useState<
    'none' | 'recording' | 'paused'
  >('none');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [amplitudeValues, setAmplitudeValues] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesIndicator, setNewMessagesIndicator] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { getIcon } = useIcons();

  const { uploadFileToBucket } = useUploadFileToBucket();
  const { sendWhatsappMessage } = useSendWhatsappMessages();
  // const { messengerSendMessage } = useMessengerSendMessage();

  // Mensagens otimistas adicionadas localmente antes da confirmação do servidor
  const [optimisticMessages, setOptimisticMessages] = useState<
    ClientChatMessage[]
  >([]);

  // Usar o hook para buscar mensagens do banco de dados
  const [lastMessage, setLastMessage] = useState<ClientChatMessage>(
    dbMessages[dbMessages.length - 1],
  );

  // Combinar mensagens do banco de dados com mensagens otimistas
  const messages = useMemo(() => {
    const combined = [...dbMessages, ...optimisticMessages];
    // Remover duplicatas baseado no providerMessageId
    const uniqueMessages = combined.filter(
      (msg, index, self) =>
        index ===
        self.findIndex((m) => m.providerMessageId === msg.providerMessageId),
    );
    // Ordenar por data não é necessário pois virão em ordem do banco
    return uniqueMessages;
  }, [dbMessages, optimisticMessages]);

  useEffect(() => {
    if (messages?.length > 0) setLastMessage(messages[messages.length - 1]);
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    } else if (!isAtBottom) {
      setNewMessagesIndicator(true);
    }
    const clientMessages = messages.filter(
      (message) =>
        message.fromType !== ChatMessageFromType.AGENT &&
        message.fromType !== ChatMessageFromType.CHATBOT,
    );
    if (clientMessages.length > 0)
      setLastFromClient(clientMessages[clientMessages.length - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const onSendMessage = async (type: MessageType) => {
    if (!selectedChat) return;

    const identifier = `${selectedChat.person?.phone}`;

    const sendMessageInputBase = {
      integrationId: selectedChat.whatsappIntegrationId,
      to: `${identifier}`,
      type,
      from: `_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
      fromMe: true,
      personId: selectedChat.person!.id,
    };

    // if (type === MessageType.FB_RESPONSE) {
    //   if (!audioBlob) {
    //     messengerSendMessage({
    //       ...sendMessageInputBase,
    //       message: newMessage.trim(),
    //     });

    //     setNewMessage('');
    //   } else if (audioBlob) {
    //     const uniqueFilename = `${identifier}-${v4()}.weba`;
    //     const audioFile = new File([audioBlob], uniqueFilename, {
    //       type: 'audio/webm',
    //     });

    //     const urlStorage = await uploadFileToBucket({
    //       file: audioFile,
    //       type: MessageType.AUDIO,
    //     });

    //     try {
    //       messengerSendMessage({
    //         ...sendMessageInputBase,
    //         type: MessageType.AUDIO,
    //         fileUrl: urlStorage,
    //       });
    //     } catch (error) {
    //       throw new Error('Failed to send audio message');
    //     }

    //     setAudioBlob(null);
    //   }
    // } else {
    if (type === MessageType.TEXT) {
      const sendMessageInput = {
        ...sendMessageInputBase,
        message:
          `*#${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}*\n` +
          newMessage.trim(),
      };

      // sendWhatsappMessage(sendMessageInput);
      setNewMessage('');
    } else if (type === MessageType.AUDIO) {
      if (!audioBlob) {
        enqueueInfoSnackBar({
          message: t`No audio recorded`,
        });
        return;
      }

      const cleanedIdentifier = identifier?.slice(1);
      const uniqueFilename = `${cleanedIdentifier}-${v4()}.weba`;
      const audioFile = new File([audioBlob], uniqueFilename, {
        type: 'audio/webm',
      });

      const urlStorage = await uploadFileToBucket({ file: audioFile, type });

      try {
        const sendMessageInput = {
          ...sendMessageInputBase,
          fileId: urlStorage,
        };

        // sendWhatsappMessage(sendMessageInput);
      } catch (error) {
        throw new Error('Failed to send audio message');
      }

      setAudioBlob(null);
    }
    // }
  };

  let audioCtx = new window.AudioContext();
  const visualize = (stream: MediaStream, recorder: MediaRecorder) => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    const bufferLength = 2048;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;
    const dataArray = new Float32Array(bufferLength);

    source.connect(analyser);

    const setValues = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const dataSquared = dataArray.map((data) => data ** 2);
      let total = 0;
      dataSquared.forEach((data) => (total += data));
      const rms = parseFloat(Math.sqrt(total / dataSquared.length).toFixed(5));
      setAmplitudeValues((prev) => [...prev.slice(-150), rms]);
    };

    const timeout = () =>
      setTimeout(() => {
        if (recorder.state === 'recording') setValues();
        if (stream.active) timeout();
      }, 50);
    timeout();
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    visualize(stream, recorder);

    const chunks: Blob[] = [];

    try {
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
      };

      recorder.onstop = () => {
        setRecordingState('none');
        setAudioBlob(null);
        setAmplitudeValues([]);
      };

      recorder.onpause = () => {
        setRecordingState('paused');
      };

      recorder.onresume = () => {
        setRecordingState('recording');
      };

      recorder.start(50);
      setMediaRecorder(recorder);
      setRecordingState('recording');
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to start recording. Check microphone access.`,
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.resume();
    }
  };

  const AnexIcon = getIcon('IconPaperclip');
  const OpenOnAnotherTab = getIcon('IconExternalLink');

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  const handleSendMessage = () => {
    if (audioBlob) {
      // Adicionar mensagem otimista
      const optimisticMessageId = `optimistic-${v4()}`;
      const optimisticMessage: ClientChatMessage = {
        clientChatId: chatId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        from: currentWorkspaceMember?.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: selectedChat.person!.phone || '',
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        providerMessageId: optimisticMessageId,
        type: ChatMessageType.AUDIO,
        textBody: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        edited: null,
        attachmentUrl: null,
        event: null,
      };

      setOptimisticMessages((prev) => [...prev, optimisticMessage]);

      onSendMessage(MessageType.AUDIO);

      // Limpar mensagens otimistas após um tempo (elas serão substituídas pelas mensagens reais do servidor)
      setTimeout(() => {
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.providerMessageId !== optimisticMessageId),
        );
      }, 5000);
    } else {
      // Adicionar mensagem otimista
      const optimisticMessageId = `optimistic-${v4()}`;
      const optimisticMessage: ClientChatMessage = {
        clientChatId: chatId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        from: currentWorkspaceMember?.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: selectedChat.providerContactId,
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        providerMessageId: optimisticMessageId,
        type: ChatMessageType.TEXT,
        textBody: newMessage,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        edited: null,
        attachmentUrl: null,
        event: null,
      };

      setOptimisticMessages((prev) => [...prev, optimisticMessage]);

      onSendMessage(MessageType.TEXT);

      // Limpar mensagens otimistas após um tempo
      setTimeout(() => {
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.providerMessageId !== optimisticMessageId),
        );
      }, 5000);
    }
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(ev.target.value);
  };

  const formatMessageContent = (message: string) => {
    return message.split('\n').map((str, index) => (
      <StyledLine key={index}>
        {str}
        {index !== message.split('\n').length - 1 && <br />}
      </StyledLine>
    ));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc(null);
  };

  const isMessageOlderThan24Hours = (date: string) => {
    const createdAt = new Date(date);
    const now = new Date().getTime();
    const diffInMilliseconds = now - createdAt.getTime();
    return diffInMilliseconds > 86400000;
  };

  const showStartConversationButton = lastMessage?.createdAt
    ? isMessageOlderThan24Hours(lastMessage.createdAt)
    : false;

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isBottom);
      if (isBottom) {
        setNewMessagesIndicator(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setNewMessagesIndicator(false);
    }
  };

  const renderButtons = () => {
    const IconMicrophone = getIcon('IconMicrophone');
    const IconArrowUp = getIcon('IconArrowUp');

    if (showStartConversationButton) {
      return (
        <StyledButton
          title="Restart conversation using a template"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={() => {
            setStartChatNumber(`+${selectedChat.providerContactId}`);
            setStartChatIntegrationId(selectedChat.whatsappIntegrationId);
          }}
        />
      );
    }

    if (
      !selectedChat.agentId &&
      selectedChat.status !== ClientChatStatus.RESOLVED
    ) {
      return (
        <StyledInputContainer>
          <StyledAnexDiv>
            <StyledIconButton
              disabled={lastMessage.type === ChatMessageType.TEMPLATE}
              Icon={recordingState === 'none' ? AnexIcon : IconTrash}
              accent={recordingState === 'none' ? 'default' : 'danger'}
              variant="tertiary"
              size="small"
              onClick={() => {
                if (recordingState === 'none') {
                  setIsAnexOpen(!isAnexOpen);
                  return;
                }
                handleStopRecording();
              }}
            />
          </StyledAnexDiv>
          {isAnexOpen && (
            <ChatAnex
              setIsAnexOpen={setIsAnexOpen}
              from={`_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`}
            />
          )}
          {recordingState !== 'none' && (
            <div
              onClick={(e) => e.preventDefault()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 30,
                overflow: 'clip',
                pointerEvents: 'none',
              }}
            >
              {amplitudeValues.map((amplitudeValue, i) => {
                return (
                  <StyledAmplitudeValue
                    key={i}
                    amplitudeValue={amplitudeValue}
                  />
                );
              })}
            </div>
          )}
          {recordingState === 'none' && (
            <StyledInput
              disabled={lastMessage.type === ChatMessageType.TEMPLATE}
              className="new-message-input"
              placeholder="Message"
              onInput={handleInputChange}
              value={newMessage}
              onKeyDown={handleInputKeyDown}
            />
          )}
          <StyledDiv>
            {!newMessage.length && (
              <StyledIconButton
                Icon={
                  recordingState !== 'recording'
                    ? IconMicrophone
                    : IconPlayerPause
                }
                onClick={() => {
                  switch (recordingState) {
                    case 'none':
                      handleStartRecording();
                      break;
                    case 'recording':
                      handlePauseRecording();
                      break;
                    case 'paused':
                      handleResumeRecording();
                      break;
                  }
                }}
                size="small"
              />
            )}
            {(newMessage.length > 0 || recordingState !== 'none') && (
              <StyledIconButton
                disabled={lastMessage.type === ChatMessageType.TEMPLATE}
                Icon={(props) => (
                  <IconArrowUp
                    {...props}
                    color={theme.font.color.inverted}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                onClick={() => {
                  handleSendMessage();
                  handleStopRecording();
                }}
                variant="primary"
                accent="blue"
                size="medium"
              />
            )}
          </StyledDiv>
        </StyledInputContainer>
      );
    }

    if (selectedChat.status !== ClientChatStatus.RESOLVED) {
      return (
        <StyledButton
          title="Start Service"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={startService}
        />
      );
    }

    return <></>;
  };

  if (lastMessage && selectedChat)
    return (
      <>
        <StyledPaneChatContainer>
          <PaneChatHeader
            avatarUrl={selectedChat.person?.avatarUrl || ''}
            name={
              selectedChat.person?.name.firstName +
              ' ' +
              selectedChat.person?.name.lastName
            }
            personId={selectedChat.person?.id || ''}
          />
          <StyledChatContainer ref={chatContainerRef} onScroll={handleScroll}>
            {messages.map((message: ClientChatMessage, index: number) => {
              const isSystemMessage =
                message.fromType !== ChatMessageFromType.PERSON;
              const messageDisplayType = getMessageDisplayType(message);
              const messageContent = getMessageContent(message);

              const validMessageType =
                messageDisplayType === MessageType.STARTED ||
                messageDisplayType === MessageType.TRANSFER ||
                messageDisplayType === MessageType.END ||
                messageDisplayType === MessageType.ONHOLD;

              let renderedContent;

              if (validMessageType)
                return (
                  <StyledMessageEvent key={message.providerMessageId}>
                    <IconExclamationCircleFilled size={13} /> {messageContent}
                  </StyledMessageEvent>
                );

              switch (messageDisplayType) {
                case MessageType.IMAGE:
                  renderedContent = (
                    <StyledImageContainer
                      key={index}
                      isSystemMessage={isSystemMessage}
                    >
                      <StyledImage
                        message={message}
                        onClick={() => {
                          setModalImageSrc(messageContent);
                          setIsModalOpen(true);
                        }}
                      />
                    </StyledImageContainer>
                  );
                  break;
                case MessageType.AUDIO:
                  renderedContent = (
                    <StyledAudio key={index} message={message} />
                  );
                  break;
                case MessageType.DOCUMENT: {
                  const fileName = messageContent
                    ? messageContent.split('/').pop()?.split('?')[0]
                    : null;
                  renderedContent = (
                    <StyledDocumentContainer
                      key={index}
                      isSystemMessage={isSystemMessage}
                    >
                      <DocumentPreview
                        fromMe={isSystemMessage}
                        documentUrl={messageContent}
                      />
                    </StyledDocumentContainer>
                  );
                  break;
                }
                case MessageType.VIDEO:
                  renderedContent = (
                    <StyledVideo
                      isSystemMessage={isSystemMessage}
                      key={index}
                      controls
                    >
                      {validVideoTypes.map((type) => (
                        <source key={type} src={messageContent} type={type} />
                      ))}
                    </StyledVideo>
                  );
                  break;
                default:
                  renderedContent = (
                    <StyledMessage
                      key={index}
                      isSystemMessage={isSystemMessage}
                    >
                      {formatMessageContent(
                        isSystemMessage
                          ? // Remover o nome do membro da primeira linha se presente
                            messageContent
                              .replace(
                                `*#${message.from.replace('_', '')}*`,
                                '',
                              )
                              .trim()
                          : messageContent,
                      )}
                    </StyledMessage>
                  );
                  break;
              }

              // const unreadIndex =
              //   messages.length - (selectedChat?.unreadMessages || 0);
              // const showUnreadMarker = index === unreadIndex;
              const lastOfRow = messages[index + 1]?.from !== message.from;

              return (
                <>
                  {/* {showUnreadMarker && (
                    <StyledUnreadMarker key={`unread-${index}`}>
                      New Messages
                    </StyledUnreadMarker>
                  )} */}

                  <StyledMessageContainer
                    key={message.providerMessageId}
                    fromMe={isSystemMessage}
                  >
                    <StyledAvatarMessage style={{ opacity: lastOfRow ? 1 : 0 }}>
                      <AvatarComponent
                        avatarUrl={
                          //this has to actually fetch the avatar url from the correct source
                          message.fromType !== ChatMessageFromType.PERSON
                            ? currentWorkspaceMember?.avatarUrl
                            : selectedChat.person?.avatarUrl
                        }
                        senderName={
                          //TODO: this has to actually fetch the name from the correct source
                          message.fromType !== ChatMessageFromType.PERSON
                            ? currentWorkspaceMember?.name.firstName
                            : selectedChat.person?.name.firstName
                        }
                      />
                    </StyledAvatarMessage>
                    <StyledContainer isSystemMessage={isSystemMessage}>
                      <StyledMessageItem isSystemMessage={isSystemMessage}>
                        <StyledMessageBubble
                          time={formatDate(message.createdAt ?? '').time}
                          message={message}
                          hasTail={lastOfRow}
                        >
                          {renderedContent}
                        </StyledMessageBubble>
                        <StyledNameAndTimeContainer
                          isSystemMessage={isSystemMessage}
                        >
                          {isMessageOlderThan24Hours(
                            message.createdAt ?? '',
                          ) ?? (
                            <StyledDateContainer>
                              {formatDate(message.createdAt ?? '').time}
                            </StyledDateContainer>
                          )}
                        </StyledNameAndTimeContainer>
                      </StyledMessageItem>
                    </StyledContainer>
                  </StyledMessageContainer>
                </>
              );
            })}
          </StyledChatContainer>
          {renderButtons()}
          {isModalOpen && modalImageSrc && (
            <StyledModalOverlay onClick={closeModal}>
              <StyledModalImage
                src={modalImageSrc}
                onClick={(ev) => ev.stopPropagation()}
              />
            </StyledModalOverlay>
          )}
        </StyledPaneChatContainer>
        {newMessagesIndicator && (
          <StyledNewMessagesButton onClick={scrollToBottom}>
            More recent
          </StyledNewMessagesButton>
        )}
      </>
    );
};
