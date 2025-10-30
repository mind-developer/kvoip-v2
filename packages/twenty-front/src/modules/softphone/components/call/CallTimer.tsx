/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { useIcons } from 'twenty-ui/display';
import { CallState } from '../../types/callState';

const StyledIncomingTimerAndIcon = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIncomingText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: normal;
`;

interface CallTimerProps {
  callState: CallState;
  elapsedTime: string;
  ringingTime: string;
}

export const CallTimer: React.FC<CallTimerProps> = ({
  callState,
  elapsedTime,
  ringingTime
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const IconPhoneOutgoing = getIcon('IconPhoneOutgoing');

  if (!callState.isInCall && !callState.ringingStartTime) {
    return null;
  }

  return (
    <StyledIncomingTimerAndIcon>
      <IconPhoneOutgoing
        color={theme.font.color.secondary}
        size={theme.icon.size.md}
      />
      <StyledIncomingText>
        {callState.callStartTime ? elapsedTime : ringingTime}
      </StyledIncomingText>
    </StyledIncomingTimerAndIcon>
  );
};
