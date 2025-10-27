import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AudioVisualizer } from '@/chat/client-chat/components/effects/AudioVisualizer';
import { UploadMediaPopup } from '@/chat/client-chat/components/input/UploadMediaPopup';
import { ChatHeader } from '@/chat/client-chat/components/layout/ChatHeader';
import AudioMessage from '@/chat/client-chat/components/message/AudioMessage';
import { CachedAvatarComponent } from '@/chat/client-chat/components/message/CachedAvatarComponent';
import EventMessage from '@/chat/client-chat/components/message/EventMessage';
import ImageMessage from '@/chat/client-chat/components/message/ImageMessage';
import { MessageBubble } from '@/chat/client-chat/components/message/MessageBubble';
import { MODAL_IMAGE_POPUP } from '@/chat/client-chat/constants/modalImagePopup';
import { useClientChatMessages } from '@/chat/client-chat/hooks/useClientChatMessages';
import { useClientChats } from '@/chat/client-chat/hooks/useClientChats';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { validVideoTypes } from '@/chat/types/FileTypes';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  overflow-x: hidden;
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

const StyledInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xxl};
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

const StyledUploadMediaDiv = styled.div`
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

export const Chat = () => {
  const { t } = useLingui();
  const theme = useTheme();

  const { chatId } = useParams() || '';
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const { chats: clientChats } = useClientChats();
  const selectedChat = clientChats.find(
    (chat: ClientChat) => chat.id === chatId,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { messages: dbMessages } = useClientChatMessages(chatId || '');
  const { sendClientChatMessage } = useSendClientChatMessage();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: 'clientChat',
  });
  const [newMessage, setNewMessage] = useState<string>('');
  const [isUploadMediaPopupOpen, setIsUploadMediaPopupOpen] =
    useState<boolean>(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [recordingState, setRecordingState] = useState<
    'none' | 'recording' | 'paused'
  >('none');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  const [audioVisualizerWidth, setAudioVisualizerWidth] = useState<number>(200);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const messages = [...dbMessages, ...optimisticMessages];

  useEffect(() => {
    setOptimisticMessages([]);
  }, [dbMessages]);

  useEffect(() => {
    if (messages?.length > 0) setLastMessage(messages[messages.length - 1]);
  }, [messages]);

  // Scroll to bottom when selected chat changes
  useEffect(() => {
    if (chatContainerRef.current && selectedChat?.id) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [selectedChat?.id]);

  const sendAudioMessage = async (chunks: Blob[]) => {
    const audioBlob = new Blob(chunks, {
      type: 'audio/webm',
    });
    setRecordingState('none');
    setAudioStream(null);
    const attachment = await uploadAttachmentFile(
      new File([audioBlob], `${v4()}_${Date.now()}.webm`, {
        type: 'audio/webm',
      }),
      {
        targetObjectNameSingular: 'person',
        id: selectedChat?.person!.id || '',
      },
    );
    sendClientChatMessage({
      clientChatId: chatId!,
      from: workspaceMemberWithAgent?.agent?.id || '',
      fromType: ChatMessageFromType.AGENT,
      to: selectedChat?.person!.id || '',
      toType: ChatMessageToType.PERSON,
      provider: ChatIntegrationProvider.WHATSAPP,
      type: ChatMessageType.AUDIO,
      textBody: null,
      caption: null,
      deliveryStatus: ChatMessageDeliveryStatus.PENDING,
      edited: null,
      attachmentUrl: attachment.attachmentAbsoluteURL,
      event: null,
      reactions: null,
      repliesTo: null,
      workspaceId: currentWorkspace?.id ?? '',
      providerIntegrationId: selectedChat?.whatsappIntegrationId ?? '',
    });
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setAudioStream(stream);

    const chunks: Blob[] = [];

    try {
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        await sendAudioMessage(chunks);
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

  useEffect(() => {
    if (!selectedChat) return;
    updateOneRecord({
      idToUpdate: selectedChat?.id || '',
      updateOneRecordInput: {
        unreadMessagesCount: 0,
      },
    });
  }, [selectedChat?.id]);

  const UploadMediaIcon = getIcon('IconPaperclip');

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  const handleSendMessage = async () => {
    if (recordingState !== 'recording' && mediaRecorder) {
      mediaRecorder && mediaRecorder.stop();
      return;
    } else {
      const optimisticMessageId = `optimistic-${v4()}`;
      const optimisticMessage: Omit<ClientChatMessage, 'providerMessageId'> = {
        clientChatId: chatId!,
        from: workspaceMemberWithAgent?.agent?.id || '',
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
        reactions: null,
        repliesTo: replyingTo,
      };

      setOptimisticMessages((prev) => [
        ...prev,
        {
          ...optimisticMessage,
          providerMessageId: optimisticMessageId,
        },
      ]);

      sendClientChatMessage({
        ...optimisticMessage,
        workspaceId: currentWorkspace?.id ?? '',
        providerIntegrationId: selectedChat.whatsappIntegrationId ?? '',
        from: workspaceMemberWithAgent?.agent?.id || '',
      });
    }
    setNewMessage('');
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(ev.target.value);
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
      if (newMessage.length > 0 || recordingState !== 'none') {
        handleSendMessage();
      }
    }
  };

  const renderButtons = () => {
    if (!selectedChat) return null;
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
          <StyledUploadMediaDiv>
            <StyledIconButton
              disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
              Icon={recordingState === 'none' ? UploadMediaIcon : IconTrash}
              accent={recordingState === 'none' ? 'default' : 'danger'}
              variant="tertiary"
              size="small"
              onClick={() => {
                if (recordingState === 'none') {
                  setIsUploadMediaPopupOpen(!isUploadMediaPopupOpen);
                  return;
                }
                mediaRecorder && mediaRecorder.stop();
              }}
            />
          </StyledUploadMediaDiv>
          {isUploadMediaPopupOpen && (
            <UploadMediaPopup
              setIsUploadMediaPopupOpen={setIsUploadMediaPopupOpen}
              clientChat={selectedChat}
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
                      mediaRecorder && mediaRecorder.pause();
                      break;
                    case 'paused':
                      mediaRecorder && mediaRecorder.resume();
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
                    color={theme.font.color.primary}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                onClick={() => {
                  // handleSendMessage();
                  mediaRecorder && mediaRecorder.stop();
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

    if (
      selectedChat.status === ClientChatStatus.UNASSIGNED ||
      selectedChat.status === ClientChatStatus.ABANDONED
    ) {
      return (
        <StyledButton
          title={
            selectedChat.status === ClientChatStatus.UNASSIGNED
              ? t`Start Service`
              : t`Restart abandoned service`
          }
          variant="secondary"
          accent="blue"
          size="medium"
          onClick={() => {
            sendClientChatMessage({
              clientChatId: selectedChat.id,
              from: workspaceMemberWithAgent?.agent?.id || '',
              fromType: ChatMessageFromType.AGENT,
              to: workspaceMemberWithAgent?.agent?.sectorId || '',
              toType: ChatMessageToType.SECTOR,
              provider: ChatIntegrationProvider.WHATSAPP,
              type: ChatMessageType.EVENT,
              textBody: null,
              caption: null,
              deliveryStatus: ChatMessageDeliveryStatus.PENDING,
              edited: null,
              attachmentUrl: null,
              event: ClientChatMessageEvent.START,
              reactions: null,
              repliesTo: null,
              workspaceId: currentWorkspace?.id ?? '',
              providerIntegrationId: selectedChat.whatsappIntegrationId ?? '',
            });
          }}
        />
      );
    }
    return null;
  };

  if (selectedChat) {
    return (
      <>
        <StyledPaneChatContainer>
          <ChatHeader
            avatarUrl={selectedChat.person?.avatarUrl || ''}
            name={
              selectedChat.person?.name?.firstName +
              ' ' +
              selectedChat.person?.name?.lastName
            }
            personId={selectedChat.person?.id || ''}
            showCloseOptions={selectedChat.status === ClientChatStatus.ASSIGNED}
          />
          <StyledChatContainer ref={chatContainerRef}>
            {(messages ?? []).map(
              (message: ClientChatMessage, index: number) => {
                const isSystemMessage =
                  message.fromType !== ChatMessageFromType.PERSON;

                let renderedContent;

                if (message.event)
                  return (
                    <StyledMessageEvent
                      initial={{ translateY: 20, opacity: 0 }}
                      animate={{
                        translateY: 0,
                        opacity: 1,
                        transition: {
                          animateDelay: index * 0.01,
                          // delay: index * 0.01,
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          mass: 0.8,
                        },
                      }}
                      key={message.providerMessageId || `event-${index}`}
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
                        <EventMessage message={message} />
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

                switch (message.type) {
                  case ChatMessageType.IMAGE:
                    renderedContent = (
                      <StyledImageContainer
                        key={message.providerMessageId || `image-${index}`}
                        isSystemMessage={isSystemMessage}
                      >
                        <ImageMessage
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
                  case ChatMessageType.AUDIO:
                    renderedContent = (
                      <AudioMessage
                        key={message.providerMessageId || `audio-${index}`}
                        message={message}
                      />
                    );
                    break;
                  case ChatMessageType.DOCUMENT: {
                    renderedContent = (
                      <StyledDocumentContainer
                        key={message.providerMessageId || `document-${index}`}
                        isSystemMessage={isSystemMessage}
                      >
                        {/* <DocumentMessage
                          fromMe={isSystemMessage}
                          documentUrl={
                            REACT_APP_SERVER_BASE_URL +
                            '/files/' +
                            message.attachmentUrl
                          }
                        /> */}
                      </StyledDocumentContainer>
                    );
                    break;
                  }
                  case ChatMessageType.VIDEO:
                    renderedContent = (
                      <StyledVideo
                        isSystemMessage={isSystemMessage}
                        key={message.providerMessageId || `video-${index}`}
                        controls
                      >
                        {validVideoTypes.map((type) => (
                          <source
                            key={
                              (message.providerMessageId || `video-${index}`) +
                              type
                            }
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
                        key={message.providerMessageId || `text-${index}`}
                        isSystemMessage={isSystemMessage}
                      >
                        {message.fromType === ChatMessageFromType.AGENT
                          ? (message.textBody ?? '')
                              ?.split('\n')
                              .slice(1)
                              .join('\n')
                          : (message.textBody ?? '').split('\n').join('\n')}
                      </StyledMessage>
                    );
                    break;
                }

                const lastOfRow = messages[index + 1]?.from !== message.from;

                return (
                  <StyledMessageContainer
                    key={message.providerMessageId || `message-${index}`}
                    fromMe={isSystemMessage}
                  >
                    <StyledAvatarMessage style={{ opacity: lastOfRow ? 1 : 0 }}>
                      <CachedAvatarComponent
                        senderId={message.from}
                        senderType={
                          message.fromType as
                            | ChatMessageFromType.PERSON
                            | ChatMessageFromType.AGENT
                            | ChatMessageFromType.CHATBOT
                        }
                        animateDelay={0}
                      />
                    </StyledAvatarMessage>
                    <StyledContainer isSystemMessage={isSystemMessage}>
                      <StyledMessageItem isSystemMessage={isSystemMessage}>
                        <MessageBubble
                          time={message.createdAt ?? ''}
                          message={message}
                          hasTail={lastOfRow}
                          animateDelay={0}
                        >
                          {renderedContent}
                        </MessageBubble>
                        <StyledNameAndTimeContainer
                          isSystemMessage={isSystemMessage}
                        >
                          {isMessageOlderThan24Hours(
                            message.createdAt ?? '',
                          ) ?? (
                            <StyledDateContainer>
                              {message.createdAt ?? ''}
                            </StyledDateContainer>
                          )}
                        </StyledNameAndTimeContainer>
                      </StyledMessageItem>
                    </StyledContainer>
                  </StyledMessageContainer>
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
      </>
    );
  }
};
