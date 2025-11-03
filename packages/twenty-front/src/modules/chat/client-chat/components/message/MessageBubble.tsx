import { CachedAvatarComponent } from '@/chat/client-chat/components/message/CachedAvatarComponent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
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
}>`
  ${({ type, isReply }) =>
    isReply
      ? 'width: 100%;'
      : type === ChatMessageType.IMAGE
        ? 'max-width: 240px;'
        : ''}
  ${({ type, isReply }) =>
    isReply ? '' : type === ChatMessageType.VIDEO ? 'max-width: 300px;' : ''}
  position: relative;

  background: ${({ fromMe, theme }) =>
    fromMe
      ? theme.name === 'dark'
        ? '#274238'
        : '#bdffcc'
      : theme.background.quaternary};
  ${({ type }) =>
    type === ChatMessageType.STICKER ? 'background: transparent;' : ''}
  color: ${({ theme }) => theme.font.color.primary};

  padding: ${({ theme, type, isFailed }) =>
    `${theme.spacing(1)} ${theme.spacing(type !== ChatMessageType.IMAGE && type !== ChatMessageType.DOCUMENT && type !== ChatMessageType.VIDEO && !isFailed ? 3 : 1)}`};
  border-radius: ${({ messageText, isReply }) =>
    messageText.length < 30 || isReply ? '15px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, type }) =>
    messageText.length < 30 || type === ChatMessageType.AUDIO
      ? 'row'
      : 'column'};
  gap: 6px;

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
    z-index: 0;
  }

  &:after {
    ${fromMe ? 'right' : 'left'}: -21px;
    width: 21px;
    background-color: ${
      theme.name === 'dark' ? 'black' : theme.background.primary
    };
    border-bottom-${fromMe ? 'left' : 'right'}-radius: 5px;
  }
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
  gap: 5px;
  color: ${({ theme }) => theme.font.color.primary};
  opacity: 0.5;
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  z-index: 3;
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
  gap: 5px;
  opacity: 0.5;
`;

const StyledMessageBubbleContainer = styled.div<{ fromPerson: boolean }>`
  display: flex;
  flex-direction: ${({ fromPerson }) => (fromPerson ? 'row' : 'row-reverse')};
  align-items: flex-start;
  gap: 5px;
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
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export const MessageBubble = ({
  children,
  message,
  time,
  hasTail,
  customButton,
  animateDelay,
  replyingTo,
  setReplyingTo,
  isReply,
}: {
  children: ReactNode;
  message: ClientChatMessage & ObjectRecord;
  time: string;
  hasTail: boolean;
  customButton?: ReactNode;
  animateDelay: number;
  setReplyingTo: (messageId: string) => void;
  replyingTo: string | null;
  isReply: boolean;
}) => {
  const { record: repliesToMessage } = useFindOneRecord({
    objectNameSingular: 'clientChatMessage',
    objectRecordId: message.repliesTo ?? '',
  });

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
      <StyledMessageBubble
        isReply={isReply}
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
          translateY: 4,
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
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isReply && (
            <StyledReplyToMessage>
              <span>Reply to:</span>
              <CachedAvatarComponent
                senderId={repliesToMessage?.from ?? ''}
                senderType={
                  repliesToMessage?.fromType as
                    | ChatMessageFromType.PERSON
                    | ChatMessageFromType.AGENT
                    | ChatMessageFromType.CHATBOT
                }
                animateDelay={0}
              />
              <span>{repliesToMessage?.textBody ?? ''}</span>
            </StyledReplyToMessage>
          )}
          {children} <>{customButton}</>
        </div>
        {!isReply && (
          <StyledTime messageType={message.type}>
            {time}
            {fromMe && <StatusIcon size={14} color={statusColor} />}
          </StyledTime>
        )}
      </StyledMessageBubble>
      <div
        onMouseEnter={() => setIsHoveringIconButton(true)}
        onMouseLeave={() => {
          setIsHoveringIconButton(false);
        }}
      >
        {!isReply && (
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
        )}
      </div>
    </StyledMessageBubbleContainer>
  );
};
