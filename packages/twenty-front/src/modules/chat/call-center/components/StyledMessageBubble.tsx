/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { MessageStatus } from '@/chat/call-center/types/MessageStatus';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChecks } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { IconCheck, IconTrash } from 'twenty-ui/display';

const StyledMessageBubbleContainer = styled.div<{ isSystemMessage: boolean }>`
  background-color: ${({ isSystemMessage, theme }) =>
    isSystemMessage
      ? theme.name === 'dark'
        ? '#171E2C'
        : '#E8EFFD'
      : theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.spacing(4)};
  max-width: max-content;
  word-wrap: break-word;
  display: flex;
  gap: 10px;

  &:before,
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    height: 25px;
  }

  &:before {
    right: -7px;
    width: 20px;
    background-color: ${({ theme }) => theme.background.primary};
    border-bottom-left-radius: 16px 14px;
  }

  &:after {
    right: -26px;
    width: 26px;
    background-color: ${({ theme }) => theme.background.primary};
    border-bottom-left-radius: 10px;
  }
`;

const StyledTime = styled.p`
  align-self: right;
  text-align: right;
  font-size: 11px;
  align-items: center;
  display: flex;
  gap: 5px;
  color: ${({ theme }) => theme.background.invertedPrimary};
  opacity: 0.5;
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
  user-select: none;
`;

export const StyledMessageBubble = ({
  children,
  isSystemMessage,
  time,
  status,
}: {
  children: ReactNode;
  isSystemMessage: boolean;
  time: string;
  status: MessageStatus;
}) => {
  const theme = useTheme();

  let StatusIcon = IconCheck;
  let statusColor = theme.background.invertedPrimary;

  switch (status) {
    case 'read':
      statusColor =
        theme.name === 'dark' ? theme.color.blue30 : theme.color.blue80;
      StatusIcon = IconChecks;
      break;
    case 'delivered':
      StatusIcon = IconChecks;
      break;
    case 'deleted':
      StatusIcon = IconTrash;
  }

  return (
    <StyledMessageBubbleContainer isSystemMessage={isSystemMessage}>
      {children}
      <StyledTime>
        {time}
        {isSystemMessage && <StatusIcon size={16} color={statusColor} />}
      </StyledTime>
    </StyledMessageBubbleContainer>
  );
};
