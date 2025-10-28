import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconCheck,
  IconChecks,
  IconClock,
  IconTrash,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../../constants/attemptingMessageKeyframes';

const StyledMessageBubble = styled(motion.div)<{
  messageText: string;
  type: ChatMessageType;
  fromMe: boolean;
  hasTail: boolean;
  isPending: boolean;
}>`
  ${({ type }) => (type === ChatMessageType.IMAGE ? 'max-width: 200px;' : '')}
  position: relative;

  background: ${({ fromMe, theme }) =>
    fromMe
      ? theme.name === 'dark'
        ? '#274238'
        : '#bdffcc'
      : theme.background.quaternary};
  color: ${({ theme }) => theme.font.color.primary};

  padding: ${({ theme, type }) =>
    `${theme.spacing(1)} ${theme.spacing(type !== ChatMessageType.IMAGE && type !== ChatMessageType.DOCUMENT ? 3 : 1)}`};
  border-radius: ${({ messageText }) =>
    messageText.length < 30 ? '15px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, type }) =>
    messageText.length < 30 || type === ChatMessageType.AUDIO
      ? 'row'
      : 'column'};
  gap: 6px;

  ${({ hasTail, fromMe: fromMe, theme }) =>
    !hasTail
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

  }
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
    props.messageType === ChatMessageType.DOCUMENT
      ? `
    position: absolute;
    right: 13px;
    bottom: 8px;
  `
      : ''}
`;

export const MessageBubble = ({
  children,
  message,
  time,
  hasTail,
  customButton,
  animateDelay,
}: {
  children: ReactNode;
  message: ClientChatMessage;
  time: string;
  hasTail: boolean;
  customButton?: ReactNode;
  animateDelay: number;
}) => {
  const theme = useTheme();
  const fromMe = message.fromType !== ChatMessageFromType.PERSON;
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;

  let StatusIcon = IconCheck;
  let statusColor = theme.background.invertedPrimary;

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
      StatusIcon = IconTrash;
      break;
  }

  return (
    <StyledMessageBubble
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
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {children} <>{customButton}</>
      </div>
      <StyledTime messageType={message.type}>
        {time}
        {fromMe && <StatusIcon size={14} color={statusColor} />}
      </StyledTime>
    </StyledMessageBubble>
  );
};
