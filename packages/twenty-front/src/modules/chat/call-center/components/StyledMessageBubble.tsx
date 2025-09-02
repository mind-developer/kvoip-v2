import { MessageStatus } from '@/chat/call-center/types/MessageStatus';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChecks, IconTrash } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { IconCheck } from 'twenty-ui/display';

const StyledMessageBubbleContainer = styled.div<{
  messageText: string;
  isSystemMessage: boolean;
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

  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};
  border-radius: 15px;
  // max-width: 75%;
  word-wrap: break-word;
  display: flex;
  flex-direction: ${({ messageText }) =>
    messageText.length < 30 ? 'row' : 'column'};
  gap: 6px;

  ${({ isSystemMessage, theme }) => `
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
`;

const StyledTime = styled.p`
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
`;

export const StyledMessageBubble = ({
  children,
  messageText,
  isSystemMessage,
  time,
  status,
}: {
  children: ReactNode;
  messageText: string;
  isSystemMessage: boolean;
  time: string;
  status: MessageStatus;
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
      isSystemMessage={isSystemMessage}
    >
      {children}
      <StyledTime>
        {time}
        {isSystemMessage && <StatusIcon size={16} color={statusColor} />}
      </StyledTime>
    </StyledMessageBubbleContainer>
  );
};
