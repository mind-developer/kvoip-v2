import { MessageStatus } from '@/chat/call-center/types/MessageStatus';
import { MessageType } from '@/chat/types/MessageType';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChecks, IconTrash } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { IconCheck } from 'twenty-ui/display';

const StyledMessageBubbleContainer = styled.div<{
  messageText: string;
  messageType: string;
  isSystemMessage: boolean;
  index: number;
  hasTail: boolean;
}>`
  position: relative;
  align-self: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'flex-start'};

  background: ${({ isSystemMessage, theme }) =>
    isSystemMessage
      ? theme.name === 'dark'
        ? '#274238'
        : '#D9FDD3'
      : theme.background.quaternary};

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
        : theme.background.quaternary
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
  animation: popup 250ms;
  animation-timing-function: cubic-bezier(0, -0.01, 0, 0.93);

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
  messageText,
  messageType,
  isSystemMessage,
  time,
  status,
  index,
  hasTail,
}: {
  children: ReactNode;
  messageText: string;
  messageType: MessageType;
  isSystemMessage: boolean;
  time: string;
  status: MessageStatus;
  index: number;
  hasTail: boolean;
}) => {
  const theme = useTheme();

  let StatusIcon = IconCheck;
  let statusColor = theme.background.invertedPrimary;

  switch (status) {
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
      messageText={messageText}
      messageType={messageType}
      isSystemMessage={isSystemMessage}
      index={index}
      hasTail={hasTail}
    >
      {children}
      <StyledTime messageType={messageType}>
        {time}
        {/* {isSystemMessage && <StatusIcon size={16} color={statusColor} />} */}
      </StyledTime>
    </StyledMessageBubbleContainer>
  );
};
