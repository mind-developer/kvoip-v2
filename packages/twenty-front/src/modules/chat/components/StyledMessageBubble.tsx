import {
  getMessageContent,
  getMessageDisplayType,
} from '@/chat/call-center/utils/clientChatMessageHelpers';
import { MessageType } from '@/chat/types/MessageType';
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
  ClientChatMessage,
} from 'twenty-shared/types';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../call-center/constants/ATTEMPTING_MESSAGE_KEYFRAMES';

const StyledMessageBubbleContainer = styled(motion.div)<{
  messageText: string;
  messageType: string;
  fromMe: boolean;
  hasTail: boolean;
  isPending: boolean;
}>`
  ${({ messageType }) => (messageType === 'image' ? 'max-width: 200px;' : '')}
  position: relative;

  background: ${({ fromMe, theme }) =>
    fromMe
      ? theme.name === 'dark'
        ? '#274238'
        : '#bdffcc'
      : theme.background.quaternary};

  padding: ${({ theme, messageType }) =>
    `${theme.spacing(1)} ${theme.spacing(messageType !== 'image' && messageType !== 'document' ? 3 : 1)}`};
  border-radius: ${({ messageText }) =>
    messageText.length < 30 ? '15px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, messageType }) =>
    messageText.length < 30 || messageType === 'audio' ? 'row' : 'column'};
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
          : '#D9FDD3'
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

const StyledTime = styled.p<{ messageType: MessageType }>`
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
    props.messageType === 'image' || props.messageType === 'document'
      ? `
    position: absolute;
    right: 13px;
    bottom: 8px;
  `
      : ''}
`;

export const StyledMessageBubble = ({
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
  const messageContent = getMessageContent(message);
  const messageType = getMessageDisplayType(message);
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
    <StyledMessageBubbleContainer
      messageText={messageContent}
      messageType={messageType}
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
      <StyledTime messageType={messageType}>
        {time}
        {fromMe && <StatusIcon size={14} color={statusColor} />}
      </StyledTime>
    </StyledMessageBubbleContainer>
  );
};
