import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { ChatMessageInput } from '@/chat/client-chat/components/input/ChatMessageInput';
import { ChatHeader } from '@/chat/client-chat/components/layout/ChatHeader';
import { ChatMessageRenderer } from '@/chat/client-chat/components/message/ChatMessageRenderer';
import { MODAL_IMAGE_POPUP } from '@/chat/client-chat/constants/modalImagePopup';
import { useClientChatsContext } from '@/chat/client-chat/contexts/ClientChatsContext';
import { useClientChatMessages } from '@/chat/client-chat/hooks/useClientChatMessages';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  type ClientChat,
  type ClientChatMessage,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledChatContainer = styled.div`
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'black' : theme.background.primary};
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  gap: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
  padding-top: 0;
  width: 100%;
`;

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
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

const StyledButton = styled(Button)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
  justify-content: center;
  width: 100%;
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

const CHAT_FOCUS_ID = 'chat-component';

export const Chat = () => {
  const { t } = useLingui();
  const { chatId } = useParams() || '';
  const { chats: clientChats } = useClientChatsContext();
  const { messages: dbMessages } = useClientChatMessages(chatId || '');
  const [messageInput, setMessageInput] = useState<string>('');

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.ClientChat,
  });

  const selectedChat = useMemo(
    () => clientChats.find((chat: ClientChat) => chat.id === chatId),
    [clientChats, chatId],
  );

  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();

  const { sendClientChatMessage } = useSendClientChatMessage();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const [recordingState, setRecordingState] = useState<
    'none' | 'recording' | 'paused'
  >('none');

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);
  const lastMessagesLengthRef = useRef<number>(0);

  const [lastMessage, setLastMessage] = useState<ClientChatMessage | null>(
    null,
  );

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: CHAT_FOCUS_ID,
      component: {
        type: FocusComponentType.SIDE_PANEL,
        instanceId: CHAT_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({ focusId: CHAT_FOCUS_ID });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
    if (!chatContainerRef.current) return;
    
    const container = chatContainerRef.current;
    
    const performScroll = () => {
      if (!container) return;
      
      // Use scrollTop directly for more reliable scrolling
      container.scrollTop = container.scrollHeight;
      
      // Double-check with requestAnimationFrame to ensure it's at the bottom
      requestAnimationFrame(() => {
        if (!container) return;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // If not fully at bottom, scroll again
        if (distanceFromBottom > 1) {
          container.scrollTop = container.scrollHeight;
        }
      });
    };
    
    if (behavior === 'smooth') {
      container.scrollTo({
        top: container.scrollHeight,
        left: 0,
        behavior: 'smooth',
      });
      // Also ensure it goes all the way after smooth animation
      setTimeout(() => {
        performScroll();
      }, 300);
    } else {
      performScroll();
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return false;
    const container = chatContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 100;
  }, []);

  useEffect(() => {
    if (selectedChat?.id) {
      updateOneRecord({
        idToUpdate: selectedChat.id,
        updateOneRecordInput: { unreadMessagesCount: 0 },
      });
    }
    setReplyingTo(null);
    userScrolledUpRef.current = false;
    lastMessagesLengthRef.current = 0;
    
    if (chatContainerRef.current && selectedChat?.id && dbMessages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [selectedChat?.id, scrollToBottom]);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;

    const handleScroll = () => {
      if (!container) return;
      
      const isNear = isNearBottom();
      
      if (isNear) {
        userScrolledUpRef.current = false;
      } else {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const wasAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        
        if (!wasAtBottom && scrollTop > 0) {
          userScrolledUpRef.current = true;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isNearBottom]);

  useEffect(() => {
    if (!chatContainerRef.current || dbMessages.length === 0) {
      lastMessagesLengthRef.current = dbMessages.length;
      return;
    }

    const hasNewMessages = dbMessages.length > lastMessagesLengthRef.current;
    let isDifferentLastMessage = false;
    
    if (lastMessagesLengthRef.current > 0) {
      const lastMessageId = dbMessages[dbMessages.length - 1]?.providerMessageId;
      const previousLastMessageId = dbMessages[lastMessagesLengthRef.current - 1]?.providerMessageId;
      isDifferentLastMessage = lastMessageId !== previousLastMessageId;
    }
    
    lastMessagesLengthRef.current = dbMessages.length;

    if ((hasNewMessages || isDifferentLastMessage) && !userScrolledUpRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [dbMessages, scrollToBottom]);

  useEffect(() => {
    if (chatContainerRef.current && dbMessages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dbMessages.length > 0)
      setLastMessage(dbMessages[dbMessages.length - 1]);
  }, [dbMessages.length]);

  const sendAudioMessage = useCallback(
    async (chunks: Blob[]) => {
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
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        attachmentUrl: attachment.attachmentAbsoluteURL,
        providerIntegrationId: selectedChat?.whatsappIntegrationId ?? '',
        textBody: null,
      });
    },
    [selectedChat, chatId, workspaceMemberWithAgent],
  );

  const handleStartRecording = useCallback(async () => {
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
  }, [sendAudioMessage, enqueueErrorSnackBar, t]);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    let lastScrollHeight = container.scrollHeight;

    const scrollToBottomIfNear = () => {
      if (!container || userScrolledUpRef.current) return;

      const currentScrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollTop + clientHeight;

      // If content height increased and we were near the bottom (within 400px), scroll to bottom
      if (
        currentScrollHeight > lastScrollHeight &&
        scrollBottom >= lastScrollHeight - 400
      ) {
        scrollToBottom('smooth');
      }

      lastScrollHeight = currentScrollHeight;
    };

    const resizeObserver = new ResizeObserver(scrollToBottomIfNear);
    resizeObserver.observe(container);

    // Also listen for media load events to catch when images and videos load
    const handleMediaLoad = () => {
      scrollToBottomIfNear();
    };

    const attachMediaListeners = () => {
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', handleMediaLoad, { once: true });
        }
      });

      // Listen for video load events (videos need loadedmetadata to know dimensions)
      const videos = container.querySelectorAll('video');
      videos.forEach((video) => {
        if (video.readyState < 1) {
          // Use loadedmetadata event which fires when video dimensions are available
          video.addEventListener('loadedmetadata', handleMediaLoad, {
            once: true,
          });
          video.addEventListener('loadeddata', handleMediaLoad, { once: true });
        }
      });
    };

    attachMediaListeners();

    // Use MutationObserver to catch dynamically added media
    const mutationObserver = new MutationObserver(() => {
      attachMediaListeners();
      scrollToBottomIfNear();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        img.removeEventListener('load', handleMediaLoad);
      });
      const videos = container.querySelectorAll('video');
      videos.forEach((video) => {
        video.removeEventListener('loadedmetadata', handleMediaLoad);
        video.removeEventListener('loadeddata', handleMediaLoad);
      });
    };
  }, [selectedChat?.id, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    setReplyingTo(null);
    if (!chatContainerRef.current) return;

    if (recordingState === 'recording' && mediaRecorder) {
      mediaRecorder && mediaRecorder.stop();
      return;
    } else {
      if (!messageInput) {
        return;
      }
      const messageBase = {
        clientChatId: chatId!,
        from: workspaceMemberWithAgent?.agent?.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: selectedChat?.person?.id ?? selectedChat?.personId ?? '',
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        type: ChatMessageType.TEXT,
        textBody: messageInput,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        repliesTo: replyingTo,
      };

      sendClientChatMessage({
        ...messageBase,
        providerIntegrationId: selectedChat?.whatsappIntegrationId || '',
        from: workspaceMemberWithAgent?.agent?.id || '',
      });
    }
    setMessageInput('');
  }, [
    recordingState,
    mediaRecorder,
    chatId,
    workspaceMemberWithAgent,
    selectedChat,
    messageInput,
    replyingTo,
    sendClientChatMessage,
  ]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalImageSrc(null);
  }, []);

  const isMessageOlderThan24Hours = useCallback((date: string) => {
    const createdAt = new Date(date);
    const now = new Date().getTime();
    const diffInMilliseconds = now - createdAt.getTime();
    return diffInMilliseconds > 86400000;
  }, []);

  const showStartConversationButton = useCallback(() => {
    if (
      selectedChat?.whatsappIntegration &&
      selectedChat?.whatsappIntegration?.apiType === 'MetaAPI'
    ) {
      return lastMessage?.createdAt
        ? isMessageOlderThan24Hours(lastMessage.createdAt)
        : false;
    }
    return false;
  }, [
    selectedChat?.whatsappIntegration,
    lastMessage,
    isMessageOlderThan24Hours,
  ]);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (messageInput.length > 0 || recordingState !== 'none') {
          handleSendMessage();
        }
      }
    },
    [messageInput, recordingState, handleSendMessage],
  );

  const handleInputChange = useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageInput(ev.target.value);
    },
    [],
  );

  const handleImageClick = useCallback((imageSrc: string) => {
    setModalImageSrc(imageSrc);
    setIsModalOpen(true);
  }, []);

  const scrollToMessage = useCallback(
    (messageId: string) => {
      if (!chatContainerRef.current) return;

      const messageInArray = dbMessages.find(
        (msg) =>
          (msg as ClientChatMessage & { id?: string }).id === messageId ||
          msg.providerMessageId === messageId,
      );

      if (!messageInArray) {
        return;
      }

      const targetMessageId =
        (messageInArray as ClientChatMessage & { id?: string }).id ||
        messageInArray.providerMessageId;

      const messageElement = chatContainerRef.current.querySelector(
        `[data-message-id="${targetMessageId}"]`,
      );

      if (messageElement) {
        setHighlightedMessageId(targetMessageId);

        messageElement.scrollIntoView({
          behavior: 'instant',
          block: 'center',
        });

        const timeout = setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    },
    [dbMessages, highlightedMessageId],
  );

  const renderedMessages = useMemo(() => {
    return dbMessages.map((message: ClientChatMessage, index: number) => {
      const lastOfRow = dbMessages[index + 1]?.from !== message.from;
      const messageId =
        (message as ClientChatMessage & { id?: string }).id ||
        message.providerMessageId;
      const isHighlighted = highlightedMessageId === messageId;
      return (
        <ChatMessageRenderer
          key={message.providerMessageId || `message-${index}`}
          message={message}
          index={index}
          onImageClick={handleImageClick}
          animateDelay={(index * 0.05) / (dbMessages.length * 0.5)}
          setReplyingTo={(messageId: string | null) => setReplyingTo(messageId)}
          onScrollToMessage={scrollToMessage}
          isHighlighted={isHighlighted}
          isLastOfRow={lastOfRow}
        />
      );
    });
  }, [
    dbMessages,
    handleImageClick,
    setReplyingTo,
    scrollToMessage,
    highlightedMessageId,
  ]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [replyingTo, scrollToBottom]);

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  const renderButtons = () => {
    if (showStartConversationButton()) {
      return (
        <StyledButton
          title="Restart conversation using a template"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={() => {
            alert('not implemented');
          }}
        />
      );
    }

    if (selectedChat.status === ClientChatStatus.ASSIGNED) {
      return (
        <ChatMessageInput
          selectedChat={selectedChat}
          newMessage={messageInput}
          onInputChange={handleInputChange}
          onInputKeyDown={handleInputKeyDown}
          recordingState={recordingState}
          onStartRecording={handleStartRecording}
          mediaRecorder={mediaRecorder}
          audioStream={audioStream}
          lastMessage={lastMessage}
          onSendMessage={handleSendMessage}
          replyingTo={replyingTo}
          setReplyingTo={(messageId: string | null) => setReplyingTo(messageId)}
        />
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
              event: ClientChatMessageEvent.START,
              deliveryStatus: ChatMessageDeliveryStatus.PENDING,
              providerIntegrationId: selectedChat.whatsappIntegrationId ?? '',
            });
          }}
        />
      );
    }
    return null;
  };

  if (selectedChat && dbMessages.length > 0)
    return (
      <StyledChatContainer>
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
        <StyledMessagesContainer ref={chatContainerRef}>
          {renderedMessages}
        </StyledMessagesContainer>
        {renderButtons()}
        {isModalOpen && modalImageSrc && (
          <StyledModalOverlay onClick={closeModal}>
            <StyledModalImage
              src={modalImageSrc}
              onClick={(ev) => ev.stopPropagation()}
            />
          </StyledModalOverlay>
        )}
      </StyledChatContainer>
    );
};
