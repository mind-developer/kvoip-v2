/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AudioVisualizer } from '@/chat/call-center/components/AudioVisualizer';
import { AvatarComponent } from '@/chat/call-center/components/AvatarComponent';
import { ChatAnex } from '@/chat/call-center/components/ChatAnex';
import DocumentPreview from '@/chat/call-center/components/DocumentPreview';
import EventDescription from '@/chat/call-center/components/EventDescription';
import { PaneChatHeader } from '@/chat/call-center/components/PaneChatHeader';
import StyledAudio from '@/chat/call-center/components/StyledAudio';
import { MODAL_IMAGE_POPUP } from '@/chat/call-center/constants/MODAL_IMAGE_POPUP';
import { useClientChatMessages } from '@/chat/call-center/hooks/useClientChatMessages';
import { useSendClientChatMessage } from '@/chat/call-center/hooks/useSendClientChatMessage';
import {
  getMessageContent,
  getMessageDisplayType,
} from '@/chat/call-center/utils/clientChatMessageHelpers';
import StyledImage from '@/chat/components/StyledImage';
import { StyledMessageBubble } from '@/chat/components/StyledMessageBubble';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { validVideoTypes } from '@/chat/types/FileTypes';
import { MessageType } from '@/chat/types/MessageType';
import { formatDate } from '@/chat/utils/formatDate';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChat,
  ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import { IconPlayerPause, IconTrash, useIcons } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { WorkspaceMember } from '~/generated/graphql';

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

const StyledChatContainer = styled.div<{ isScrolling: boolean }>`
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

  /* Always show scrollbar but with opacity transition */
  scrollbar-width: thin; /* Firefox */
  -ms-overflow-style: auto; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    width: 6px;
    transition: opacity 0.3s ease-in-out;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border.color.medium};
    border-radius: 3px;
    transition: opacity 0.3s ease-in-out;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.border.color.strong};
  }
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
  width: 150px;
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
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xxl};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
`;

const StyledInput = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: ${({ theme }) => theme.font.size.md};
  font-family: ${({ theme }) => theme.font.family};
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 20px;
`;

const StyledDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3.5)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledAnexDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
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

const StyledMessageEvent = styled(motion.div)`
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
  const { t } = useLingui();
  const theme = useTheme();

  const { chatId } = useParams() || '';
  const { record: selectedChat } = useFindOneRecord<
    ClientChat & { __typename: string }
  >({
    objectNameSingular: 'clientChat',
    objectRecordId: chatId,
    recordGqlFields: {
      id: true,
      providerContactId: true,
      whatsappIntegrationId: true,
      messengerIntegrationId: true,
      telegramIntegrationId: true,
      status: true,
      person: true,
      sector: true,
      agent: true,
    },
    skip: !chatId,
  });
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: 'clientChat',
  });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { record: currentMember } = useFindOneRecord<
    WorkspaceMember & { __typename: string; agentId: string }
  >({
    objectNameSingular: 'workspaceMember',
    objectRecordId: currentWorkspaceMember?.id || '',
    skip: !currentWorkspaceMember?.id,
  });
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { messages: dbMessages } = useClientChatMessages(chatId || '');
  const { sendClientChatMessage } = useSendClientChatMessage();

  const [newMessage, setNewMessage] = useState<string>('');
  const [isAnexOpen, setIsAnexOpen] = useState<boolean>(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [recordingState, setRecordingState] = useState<
    'none' | 'recording' | 'paused'
  >('none');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  const [audioVisualizerWidth, setAudioVisualizerWidth] = useState<number>(200);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesIndicator, setNewMessagesIndicator] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getIcon } = useIcons();

  useEffect(() => {
    if (audioVisualizerRef.current) {
      setAudioVisualizerWidth(audioVisualizerRef.current.clientWidth);
    }
  }, [audioVisualizerRef.current]);

  // Mensagens otimistas adicionadas localmente antes da confirmação do servidor
  const [optimisticMessages, setOptimisticMessages] = useState<
    ClientChatMessage[]
  >([]);

  const [lastMessage, setLastMessage] = useState<ClientChatMessage | null>(
    null,
  );

  const messages = useMemo(() => {
    return [...dbMessages, ...optimisticMessages];
  }, [dbMessages, optimisticMessages]);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [dbMessages]);

  useEffect(() => {
    if (messages?.length > 0) setLastMessage(messages[messages.length - 1]);
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    } else if (!isAtBottom) {
      setNewMessagesIndicator(true);
    }
  }, [messages]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setAudioStream(stream);

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
        setAudioStream(null);
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

  useEffect(() => {
    if (!selectedChat) return;
    scrollToBottom();
  }, [selectedChat?.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const AnexIcon = getIcon('IconPaperclip');

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  const handleSendMessage = async () => {
    if (audioBlob) {
      const attachment = await uploadAttachmentFile(
        new File([audioBlob], `${Date.now()}.ogg}`, { type: 'audio/ogg' }),
        {
          targetObjectNameSingular: 'person',
          id: selectedChat.person!.id,
        },
      );
      alert(attachment.attachmentAbsoluteURL);
      const optimisticMessageId = `optimistic-${v4()}`;
      const optimisticMessage: ClientChatMessage = {
        clientChatId: chatId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        from: currentWorkspaceMember?.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: selectedChat.person!.id || '',
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        providerMessageId: optimisticMessageId,
        type: ChatMessageType.AUDIO,
        textBody: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        edited: null,
        attachmentUrl: attachment.attachmentAbsoluteURL,
        event: null,
      };
      setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    } else {
      const optimisticMessageId = `optimistic-${v4()}`;
      const optimisticMessage: Omit<ClientChatMessage, 'providerMessageId'> = {
        clientChatId: chatId!,
        from: currentWorkspaceMember?.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: selectedChat.person!.id,
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        type: ChatMessageType.TEXT,
        textBody: newMessage,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        edited: null,
        attachmentUrl: null,
        event: null,
      };

      setOptimisticMessages((prev) => [
        ...prev,
        {
          ...optimisticMessage,
          providerMessageId: optimisticMessageId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      sendClientChatMessage({
        ...optimisticMessage,
        workspaceId: currentWorkspace?.id ?? '',
        providerIntegrationId: selectedChat.whatsappIntegrationId ?? '',
        from: selectedChat.agent.id || '',
      });
    }
    setNewMessage('');
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

      // Show scrollbar when scrolling
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

      if (isBottom) {
        setNewMessagesIndicator(false);
        if (selectedChat?.unreadMessagesCount > 0) {
          updateOneRecord({
            idToUpdate: selectedChat?.id || '',
            updateOneRecordInput: {
              unreadMessagesCount: 0,
            },
          });
        }
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
          onClick={() => {}}
        />
      );
    }

    if (selectedChat.status === ClientChatStatus.ASSIGNED) {
      return (
        <StyledInputContainer>
          <StyledAnexDiv>
            <StyledIconButton
              disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
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
            <ChatAnex setIsAnexOpen={setIsAnexOpen} clientChat={selectedChat} />
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
              ref={audioVisualizerRef}
            >
              <AudioVisualizer
                stream={audioStream}
                isRecording={recordingState === 'recording'}
                width={audioVisualizerWidth}
                barWidth={audioVisualizerWidth / 20}
                color={theme.font.color.primary}
                barCount={80}
                scrollSpeed={1}
              />
            </div>
          )}
          {recordingState === 'none' && (
            <StyledInput
              disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
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
                disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
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

    if (selectedChat.status === ClientChatStatus.UNASSIGNED) {
      return (
        <StyledButton
          title="Start Service"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={() => {
            sendClientChatMessage({
              clientChatId: selectedChat.id,
              from: currentMember?.agentId || '',
              fromType: ChatMessageFromType.AGENT,
              to: selectedChat.sectorId || '',
              toType: ChatMessageToType.SECTOR,
              provider: ChatIntegrationProvider.WHATSAPP,
              type: ChatMessageType.EVENT,
              textBody: null,
              caption: null,
              deliveryStatus: ChatMessageDeliveryStatus.PENDING,
              edited: null,
              attachmentUrl: null,
              event: ClientChatMessageEvent.START,
              workspaceId: currentWorkspace?.id ?? '',
              providerIntegrationId: selectedChat.whatsappIntegrationId ?? '',
            });
          }}
        />
      );
    }

    return null;
  };

  if (selectedChat)
    return (
      <>
        <StyledPaneChatContainer>
          <PaneChatHeader
            avatarUrl={selectedChat.person?.avatarUrl || ''}
            name={
              selectedChat.person?.name?.firstName +
              ' ' +
              selectedChat.person?.name?.lastName
            }
            personId={selectedChat.person?.id || ''}
            showCloseOptions={selectedChat.status === ClientChatStatus.ASSIGNED}
          />
          <StyledChatContainer
            ref={chatContainerRef}
            onScroll={handleScroll}
            isScrolling={isScrolling}
          >
            {(messages ?? []).map(
              (message: ClientChatMessage, index: number) => {
                const isSystemMessage =
                  message.fromType !== ChatMessageFromType.PERSON;
                const messageDisplayType = getMessageDisplayType(message);
                const messageContent = getMessageContent(message);

                let renderedContent;

                if (message.event)
                  return (
                    <StyledMessageEvent
                      initial={{ translateY: 20, opacity: 0 }}
                      animate={{
                        translateY: 0,
                        opacity: 1,
                        transition: {
                          delay: index * 0.01,
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          mass: 0.8,
                        },
                      }}
                      key={message.providerMessageId}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: theme.spacing(2),
                        }}
                      >
                        <EventDescription message={message} />
                        <div
                          style={{
                            height: 1,
                            width: '70%',
                            opacity: 0.5,
                            backgroundColor: theme.border.color.medium,
                          }}
                        />
                      </div>
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
                            setModalImageSrc(
                              REACT_APP_SERVER_BASE_URL +
                                '/files/' +
                                message.attachmentUrl,
                            );
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
                    renderedContent = (
                      <StyledDocumentContainer
                        key={index}
                        isSystemMessage={isSystemMessage}
                      >
                        <DocumentPreview
                          fromMe={isSystemMessage}
                          documentUrl={
                            REACT_APP_SERVER_BASE_URL +
                            '/files/' +
                            message.attachmentUrl
                          }
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
                          <source
                            key={type}
                            src={
                              REACT_APP_SERVER_BASE_URL +
                              '/files/' +
                              message.attachmentUrl
                            }
                            type={type}
                          />
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
                      <StyledAvatarMessage
                        style={{ opacity: lastOfRow ? 1 : 0 }}
                      >
                        <AvatarComponent
                          senderId={message.from}
                          senderType={
                            message.fromType as
                              | ChatMessageFromType.PERSON
                              | ChatMessageFromType.AGENT
                              | ChatMessageFromType.CHATBOT
                          }
                          animateDelay={index * 0.01}
                        />
                      </StyledAvatarMessage>
                      <StyledContainer isSystemMessage={isSystemMessage}>
                        <StyledMessageItem isSystemMessage={isSystemMessage}>
                          <StyledMessageBubble
                            time={formatDate(message.createdAt ?? '').time}
                            message={message}
                            hasTail={lastOfRow}
                            animateDelay={index * 0.01}
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
              },
            )}
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
