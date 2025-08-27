/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledMessageBubbleContainer = styled.div<{ isSystemMessage: boolean }>`
  background-color: ${({ isSystemMessage, theme }) =>
    isSystemMessage
      ? theme.name === 'dark'
        ? '#171E2C'
        : '#E8EFFD'
      : theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.spacing(3)};
  max-width: max-content;
  word-wrap: break-word;
`;

const StyledTime = styled.p`
  align-self: right;
  text-align: right;
  color: ${({ theme }) => theme.background.invertedPrimary};
  opacity: 0.5;
  width: 100%;
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMessageBubble = ({
  children,
  isSystemMessage,
  time,
}: {
  children: ReactNode;
  isSystemMessage: boolean;
  time: string;
}) => {
  return (
    <StyledMessageBubbleContainer isSystemMessage={isSystemMessage}>
      {children}
      <StyledTime>{time}</StyledTime>
    </StyledMessageBubbleContainer>
  );
};
