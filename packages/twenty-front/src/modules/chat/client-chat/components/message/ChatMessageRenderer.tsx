import AudioMessage from '@/chat/client-chat/components/message/AudioMessage';
import DocumentMessage from '@/chat/client-chat/components/message/DocumentMessage';
import EventMessage from '@/chat/client-chat/components/message/EventMessage';
import ImageMessage from '@/chat/client-chat/components/message/ImageMessage';
import { MessageBubble } from '@/chat/client-chat/components/message/MessageBubble';
import { StickerMessage } from '@/chat/client-chat/components/message/StickerMessage';
import VideoMessage from '@/chat/client-chat/components/message/VideoMessage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { memo } from 'react';
import {
  ChatMessageFromType,
  ChatMessageType,
  type ClientChatMessage,
} from 'twenty-shared/types';

const StyledMessageEvent = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  padding-block: ${({ theme }) => theme.spacing(3)};
`;

const StyledMessageContainer = styled.div<{
  fromMe: boolean;
  isHighlighted: boolean;
}>`
  display: flex;
  flex-direction: ${({ fromMe }) => (fromMe ? 'row-reverse' : 'row')};
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  transition: all 0.15s;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAvatarMessage = styled.div`
  align-self: flex-end;
  z-index: 1;
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

// Removed inline StyledVideo in favor of dedicated VideoMessage component

const StyledImageContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
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

type ChatMessageRendererProps = {
  message: ClientChatMessage;
  index: number;
  isLastOfRow: boolean;
  onImageClick: (imageSrc: string) => void;
  animateDelay: number;
  setReplyingTo: (messageId: string | null) => void;
  onScrollToMessage: (messageId: string) => void;
  isHighlighted: boolean;
};

export const ChatMessageRenderer = memo(
  ({
    message,
    index,
    onImageClick,
    animateDelay,
    setReplyingTo,
    onScrollToMessage,
    isHighlighted,
    isLastOfRow,
  }: ChatMessageRendererProps) => {
    const theme = useTheme();

    const isMessageOlderThan24Hours = (date: string) => {
      const createdAt = new Date(date);
      const now = new Date().getTime();
      const diffInMilliseconds = now - createdAt.getTime();
      return diffInMilliseconds > 86400000;
    };

    if (message.event) {
      return (
        <StyledMessageEvent
          initial={{ translateY: 20, opacity: 0 }}
          animate={{
            translateY: 0,
            opacity: 1,
            transition: {
              delay: animateDelay,
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
    }

    let renderedContent;

    switch (message.type) {
      case ChatMessageType.IMAGE:
        renderedContent = (
          <StyledImageContainer
            key={message.providerMessageId || `image-${index}`}
            isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
          >
            <ImageMessage
              message={message}
              onClick={() => {
                onImageClick(message.attachmentUrl ?? '');
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
            isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
          >
            <DocumentMessage
              fromMe={message.fromType !== ChatMessageFromType.PERSON}
              documentUrl={message.attachmentUrl ?? ''}
            />
          </StyledDocumentContainer>
        );
        break;
      }
      case ChatMessageType.VIDEO:
        renderedContent = (
          <VideoMessage
            key={message.providerMessageId || `video-${index}`}
            message={message}
          />
        );
        break;
      case ChatMessageType.STICKER:
        renderedContent = (
          <StickerMessage
            key={message.providerMessageId || `sticker-${index}`}
            message={message}
          />
        );
        break;
      default:
        renderedContent = (
          <StyledMessage
            key={message.providerMessageId || `text-${index}`}
            isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
          >
            {message.fromType === ChatMessageFromType.AGENT
              ? (message.textBody ?? '')?.split('\n').slice(1).join('\n')
              : (message.textBody ?? '').split('\n').join('\n')}
          </StyledMessage>
        );
        break;
    }

    return (
      <StyledMessageContainer
        key={message.providerMessageId || `message-${index}`}
        fromMe={message.fromType !== ChatMessageFromType.PERSON}
        data-message-id={
          (message as ClientChatMessage & { id?: string }).id ||
          message.providerMessageId
        }
        isHighlighted={isHighlighted}
      >
        <StyledContainer
          isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
        >
          <StyledMessageItem
            isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
          >
            <MessageBubble
              time={message.createdAt ?? ''}
              message={message as ClientChatMessage & ObjectRecord}
              hasTail={isLastOfRow}
              animateDelay={animateDelay}
              setReplyingTo={setReplyingTo}
              isReply={false}
              onScrollToMessage={onScrollToMessage}
              isHighlighted={isHighlighted}
            >
              {renderedContent}
            </MessageBubble>
            <StyledNameAndTimeContainer
              isSystemMessage={message.fromType !== ChatMessageFromType.PERSON}
            >
              {isMessageOlderThan24Hours(message.createdAt ?? '') ?? (
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
);
