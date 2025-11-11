import { CachedAvatarComponent } from '@/chat/client-chat/components/message/CachedAvatarComponent';
import { MessageQuotePreview } from '@/chat/client-chat/components/message/MessageQuotePreview';
import { BUBBLE_COLOR } from '@/chat/client-chat/constants/BUBBLE_COLOR';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconArrowBack,
  IconArrowForward,
  IconCheck,
  IconChecks,
  IconClock,
  IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageType,
  type ClientChatMessage,
} from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/input';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../../constants/attemptingMessageKeyframes';

const StyledMessageBubble = styled(motion.div)<{
  messageText: string;
  type: ChatMessageType;
  fromMe: boolean;
  hasTail: boolean;
  isPending: boolean;
  isFailed: boolean;
  isReply: boolean;
  isHighlighted: boolean;
  themeName: string;
  hasQuotePreview: boolean;
  provider: ChatIntegrationProvider;
}>`
  ${({ type, isReply, hasQuotePreview }) =>
    isReply
      ? 'width: 100%;'
      : hasQuotePreview
        ? 'min-width: fit-content;'
        : type === ChatMessageType.IMAGE
          ? 'max-width: 240px;'
          : 'max-width: 300px;'}
  ${({ type, isReply, hasQuotePreview }) =>
    isReply || hasQuotePreview
      ? ''
      : type === ChatMessageType.VIDEO
        ? 'max-width: 300px;'
        : ''}
  position: relative;
  text-overflow: '-';
  overflow: hidden;
  white-space: pre-wrap;

  background: ${({ fromMe, theme, type, provider }) => {
    if (type === ChatMessageType.STICKER) {
      return 'transparent';
    }
    return fromMe
      ? (BUBBLE_COLOR[provider]?.[theme.name as 'light' | 'dark'] ??
          theme.background.primary)
      : theme.background.quaternary;
  }};
  ${({ type }) =>
    type === ChatMessageType.STICKER ? 'background: transparent;' : ''}
  color: ${({ theme }) => theme.font.color.primary};
  transition: scale 1.5s ease;
  animation: ${({ isHighlighted, themeName }) =>
    isHighlighted
      ? themeName === 'dark'
        ? 'highlightPulseDark 1.5s ease-out'
        : 'highlightPulseLight 1.5s ease-out'
      : 'none'};

  @keyframes highlightPulseDark {
    0% {
      scale: 0.95;
      opacity: 0;
    }
    100% {
      scale: 1;
      opacity: 1;
    }
  }

  @keyframes highlightPulseLight {
    0% {
      scale: 0.95;
      opacity: 0;
    }
    100% {
      scale: 1;
      opacity: 1;
    }
  }

  padding: ${({ theme, type, isFailed, hasQuotePreview }) => {
    const isMediaType =
      type === ChatMessageType.IMAGE ||
      type === ChatMessageType.DOCUMENT ||
      type === ChatMessageType.VIDEO;

    const horizontalPadding = hasQuotePreview
      ? theme.spacing(2.5)
      : isMediaType || isFailed
        ? theme.spacing(1)
        : theme.spacing(3);

    let topPadding = hasQuotePreview ? theme.spacing(2) : theme.spacing(1.5);
    let bottomPadding = theme.spacing(1);
    if (
      type === ChatMessageType.VIDEO ||
      type === ChatMessageType.IMAGE ||
      type === ChatMessageType.DOCUMENT
    ) {
      topPadding = theme.spacing(1);
      bottomPadding = theme.spacing(1);
    }

    return `${topPadding} ${horizontalPadding} ${bottomPadding} ${horizontalPadding}`;
  }};
  border-radius: ${({ messageText, isReply }) =>
    messageText.length < 30 || isReply ? '15px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, type, hasQuotePreview }) =>
    messageText.length < 30 || type === ChatMessageType.AUDIO
      ? 'row'
      : hasQuotePreview
        ? 'column'
        : 'column'};
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ hasTail, fromMe, theme, type, isReply }) =>
    !hasTail || type === ChatMessageType.STICKER || isReply
      ? ''
      : `
  &:before, &:after {
    content: '';
    position: absolute;
    bottom: 0;
    height: 15px;
  }

  &:before {
    ${fromMe ? 'right' : 'left'}: -8px;
    width: 20px;
    background: ${
      fromMe
        ? theme.name === 'dark'
          ? '#274238'
          : '#bdffcc'
        : theme.background.quaternary
    };
    border-bottom-${fromMe ? 'left' : 'right'}-radius: 15px;
  }

  &:after {
    ${fromMe ? 'right' : 'left'}: -21px;
    width: 21px;
    background-color: ${
      theme.name === 'dark' ? 'black' : theme.background.primary
    };
    border-bottom-${fromMe ? 'left' : 'right'}-radius: 5px;
  }
    align-self: flex-end;
`}
  ${({ isPending }) => (isPending ? ATTEMPTING_MESSAGE_KEYFRAMES : '')}
  min-height: 20px;
`;

const StyledTime = styled.p<{ messageType: ChatMessageType }>`
  align-self: flex-end;
  text-align: right;
  font-size: 11px;
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  opacity: 0.5;
  margin: 0;
  user-select: none;
  z-index: 3;
  flex-shrink: 0;
  ${(props) =>
    props.messageType === ChatMessageType.IMAGE ||
    props.messageType === ChatMessageType.DOCUMENT ||
    props.messageType === ChatMessageType.VIDEO ||
    props.messageType === ChatMessageType.STICKER
      ? `
    position: absolute;
    right: 13px;
    bottom: 8px;
  `
      : ''}
`;

const StyledUnsupportedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  opacity: 0.5;
`;

const StyledMessageBubbleContainer = styled.div<{ fromPerson: boolean }>`
  display: flex;
  flex-direction: ${({ fromPerson }) => (fromPerson ? 'row-reverse' : 'row')};
  align-items: flex-end;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconButton = styled(IconButton)<{ isVisible: boolean }>`
  border-radius: 50%;
  aspect-ratio: 1/1;
  scale: 0.8;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  height: 30px;
`;

const StyledReplyToMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  min-width: 20px;
  padding: 0;
  border-radius: 50%;
  z-index: 10;
`;

const StyledAvatarWrapper = styled.div<{
  isHidden: boolean;
}>`
  opacity: ${({ isHidden }) => (isHidden ? 0 : 1)};
  z-index: ${({ isHidden }) => (isHidden ? 0 : 1)};
`;

export const MessageBubble = ({
  children,
  message,
  time,
  hasTail,
  customButton,
  animateDelay,
  setReplyingTo,
  isReply,
  onScrollToMessage,
  isHighlighted,
}: {
  children: ReactNode;
  message: ClientChatMessage & ObjectRecord;
  time: string;
  hasTail: boolean;
  customButton?: ReactNode;
  animateDelay: number;
  setReplyingTo: (messageId: string | null) => void;
  isReply: boolean;
  onScrollToMessage?: (messageId: string) => void;
  isHighlighted?: boolean;
}) => {
  const theme = useTheme();
  const fromMe = message.fromType !== ChatMessageFromType.PERSON;
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;

  let StatusIcon = IconCheck;
  let statusColor = theme.background.invertedPrimary;

  const [isHoveringBubble, setIsHoveringBubble] = useState(false);
  const [isHoveringIconButton, setIsHoveringIconButton] = useState(false);

  switch (message.deliveryStatus) {
    case ChatMessageDeliveryStatus.PENDING:
      StatusIcon = IconClock;
      break;
    case ChatMessageDeliveryStatus.READ:
      statusColor = theme.name === 'dark' ? '#08a5e9' : '#1B8BF7';
      StatusIcon = IconChecks;
      break;
    case ChatMessageDeliveryStatus.DELIVERED:
      StatusIcon = IconChecks;
      break;
    case ChatMessageDeliveryStatus.FAILED:
      StatusIcon = IconX;
      break;
  }

  return (
    <StyledMessageBubbleContainer fromPerson={!fromMe}>
      {!isReply && (
        <div
          onMouseEnter={() => setIsHoveringIconButton(true)}
          onMouseLeave={() => {
            setIsHoveringIconButton(false);
          }}
        >
          <StyledIconButton
            variant="secondary"
            Icon={fromMe ? IconArrowForward : IconArrowBack}
            onClick={() => {
              setReplyingTo(message.id);
            }}
            isVisible={
              isHoveringBubble ||
              (isHoveringIconButton &&
                message.type !== ChatMessageType.UNSUPPORTED &&
                message.type !== ChatMessageType.EVENT)
            }
          />
        </div>
      )}
      <StyledMessageBubble
        provider={message.provider}
        isReply={isReply}
        isHighlighted={isHighlighted ?? false}
        themeName={theme.name}
        onMouseEnter={() => setIsHoveringBubble(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            setIsHoveringBubble(false);
          }, 100);
        }}
        messageText={message.textBody || ''}
        type={message.type}
        fromMe={fromMe}
        hasTail={hasTail}
        isPending={isPending}
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
        isFailed={message.deliveryStatus === ChatMessageDeliveryStatus.FAILED}
        hasQuotePreview={!!(message.repliesTo && !isReply)}
      >
        {isReply && (
          <StyledCloseButton
            variant="tertiary"
            Icon={IconX}
            onClick={() => {
              setReplyingTo(null);
            }}
            size="small"
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!isReply && message.repliesTo && (
            <StyledReplyToMessage>
              <MessageQuotePreview
                messageId={message.repliesTo}
                onScrollToMessage={onScrollToMessage}
              />
            </StyledReplyToMessage>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent:
                (message.textBody?.length ?? 0) < 30 &&
                message.type !== ChatMessageType.IMAGE &&
                message.type !== ChatMessageType.DOCUMENT &&
                message.type !== ChatMessageType.VIDEO &&
                message.type !== ChatMessageType.STICKER
                  ? 'space-between'
                  : 'flex-start',
              width: '100%',
              gap: theme.spacing(1),
            }}
          >
            <div style={{ flex: '0 1 auto', zIndex: 1 }}>{children}</div>
            {!isReply &&
              (message.textBody?.length ?? 0) < 30 &&
              message.type !== ChatMessageType.IMAGE &&
              message.type !== ChatMessageType.DOCUMENT &&
              message.type !== ChatMessageType.VIDEO &&
              message.type !== ChatMessageType.STICKER && (
                <StyledTime messageType={message.type}>
                  {time}
                  {fromMe && <StatusIcon size={14} color={statusColor} />}
                </StyledTime>
              )}
          </div>
          <>{customButton}</>
        </div>
        {!isReply &&
          ((message.textBody?.length ?? 0) >= 30 ||
            message.type === ChatMessageType.IMAGE ||
            message.type === ChatMessageType.DOCUMENT ||
            message.type === ChatMessageType.VIDEO ||
            message.type === ChatMessageType.STICKER) && (
            <StyledTime messageType={message.type}>
              {time}
              {fromMe && <StatusIcon size={14} color={statusColor} />}
            </StyledTime>
          )}
      </StyledMessageBubble>
      {!isReply && (
        <StyledAvatarWrapper isHidden={!hasTail}>
          <CachedAvatarComponent
            senderId={message.from}
            senderType={
              message.fromType as
                | ChatMessageFromType.PERSON
                | ChatMessageFromType.AGENT
                | ChatMessageFromType.CHATBOT
            }
            animateDelay={animateDelay}
            showName={false}
          />
        </StyledAvatarWrapper>
      )}
    </StyledMessageBubbleContainer>
  );
};
