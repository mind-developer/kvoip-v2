import { MessageStatus } from '@/chat/call-center/types/MessageStatus';
import { MessageType } from '@/chat/types/MessageType';
import { IMessage } from '@/chat/types/WhatsappDocument';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChecks, IconClock, IconTrash } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { IconCheck } from 'twenty-ui/display';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../constants/ATTEMPTING_MESSAGE_KEYFRAMES';

const StyledMessageBubbleContainer = styled.div<{
  messageText: string;
  messageType: string;
  isSystemMessage: boolean;
  index: number;
  hasTail: boolean;
  status: MessageStatus;
}>`
  position: relative;
  align-self: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'flex-start'};

  background: ${({ isSystemMessage, theme }) =>
    isSystemMessage
      ? theme.name === 'dark'
        ? '#274238'
        : '#D9FDD3'
      : theme.background.secondary};

  padding: ${({ theme, messageType }) =>
    `${theme.spacing(1)} ${theme.spacing(messageType !== 'image' ? 3 : 1)}`};
  border-radius: ${({ messageText, messageType }) =>
    messageText.length < 30 ? '20px' : '15px'};
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText, messageType }) =>
    messageText.length < 30 || messageType === 'audio' ? 'row' : 'column'};
  gap: 6px;

  ${({ hasTail, isSystemMessage, theme }) =>
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
    ${isSystemMessage ? 'right' : 'left'}: -8px;
    width: 20px;
    background: ${
      isSystemMessage
        ? theme.name === 'dark'
          ? '#274238'
          : '#D9FDD3'
        : theme.background.secondary
    };
    border-bottom-${isSystemMessage ? 'left' : 'right'}-radius: 15px;
    z-index: 0;
  }

  &:after {
    ${isSystemMessage ? 'right' : 'left'}: -21px;
    width: 21px;
    background-color: ${theme.background.primary};
    border-bottom-${isSystemMessage ? 'left' : 'right'}-radius: 5px;
  }
`}
  ${({ status }) =>
    status === 'attempting' ? ATTEMPTING_MESSAGE_KEYFRAMES : ''}

  @keyframes popup {
    0% {
      transform: translateY(25px);
    }
    100% {
      transform: translateY(0);
    }
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
    props.messageType === 'image'
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
  isSystemMessage,
  time,
  index,
  hasTail,
  customButton,
}: {
  children: ReactNode;
  message: IMessage;
  isSystemMessage: boolean;
  time: string;
  index: number;
  hasTail: boolean;
  customButton?: ReactNode;
}) => {
  const theme = useTheme();

  let StatusIcon = IconCheck;
  let statusColor = theme.background.invertedPrimary;

  switch (message.status) {
    case 'attempting':
      StatusIcon = IconClock;
      break;
    case 'read':
      statusColor = theme.name === 'dark' ? '#08a5e9' : '#1B8BF7';
      StatusIcon = IconChecks;
      break;
    case 'delivered':
      StatusIcon = IconChecks;
      break;
    case 'deleted':
      StatusIcon = IconTrash;
  }

  return (
    <StyledMessageBubbleContainer
      messageText={message.message ?? ''}
      messageType={message.type}
      isSystemMessage={isSystemMessage}
      index={index}
      hasTail={hasTail}
      status={message.status}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {children} <>{customButton}</>
      </div>
      <StyledTime messageType={message.type as MessageType}>
        {time}
        {isSystemMessage && message.status === 'attempting' && (
          <StatusIcon size={12} color={statusColor} />
        )}
      </StyledTime>
    </StyledMessageBubbleContainer>
  );
};
