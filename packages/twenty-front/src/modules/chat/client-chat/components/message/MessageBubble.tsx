import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  IconAlertCircle,
  IconArrowBack,
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
}>`
  ${({ type }) => (type === ChatMessageType.IMAGE ? 'max-width: 240px;' : '')}
  ${({ type }) => (type === ChatMessageType.VIDEO ? 'max-width: 300px;' : '')}
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
  border-radius: ${({ messageText }) =>
    messageText.length < 30 ? '15px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, type }) =>
    messageText.length < 30 || type === ChatMessageType.AUDIO
      ? 'row'
      : 'column'};
  gap: 6px;

  ${({ hasTail, fromMe: fromMe, theme, type }) =>
    !hasTail || type === ChatMessageType.STICKER
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

const StyledMessageBubbleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 5px;
  transform: translateY(6px);
`;

const StyledIconButton = styled(IconButton)<{ isVisible: boolean }>`
  border-radius: 50%;
  aspect-ratio: 1/1;
  scale: 0.8;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  height: 30px;
`;

export const MessageBubble = ({
  children,
  message,
  time,
  hasTail,
  customButton,
  animateDelay,
  setIsReplyingTo,
}: {
  children: ReactNode;
  message: ClientChatMessage;
  time: string;
  hasTail: boolean;
  customButton?: ReactNode;
  animateDelay: number;
  setIsReplyingTo: (messageId: string) => void;
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
    <StyledMessageBubbleContainer>
      <StyledMessageBubble
        onMouseEnter={() => setIsHoveringBubble(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            setIsHoveringBubble(false);
          }, 500);
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
          {children} <>{customButton}</>
        </div>
        {message.type === ChatMessageType.UNSUPPORTED && (
          <StyledUnsupportedMessage>
            <IconAlertCircle size={14} color={theme.font.color.primary} />
            <span>{t`This message type is currently not supported`}</span>
          </StyledUnsupportedMessage>
        )}
        <StyledTime messageType={message.type}>
          {time}
          {fromMe && <StatusIcon size={14} color={statusColor} />}
        </StyledTime>
      </StyledMessageBubble>
      <div
        onMouseEnter={() => setIsHoveringIconButton(true)}
        onMouseLeave={() => {
          setIsHoveringIconButton(false);
        }}
      >
        <StyledIconButton
          variant="secondary"
          Icon={IconArrowBack}
          onClick={() => {}}
          isVisible={isHoveringBubble || isHoveringIconButton}
        />
      </div>
    </StyledMessageBubbleContainer>
  );
};
