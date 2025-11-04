/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { useIcons } from 'twenty-ui/display';

const StyledIncomingCall = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIncomingText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: normal;
`;

interface IncomingCallHeaderProps {}

const IncomingCallHeader: React.FC<IncomingCallHeaderProps> = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const PhoneIncoming = getIcon('IconPhoneIncoming');

  return (
    <StyledIncomingCall>
      <PhoneIncoming
        color={theme.font.color.secondary}
        size={theme.icon.size.md}
      />
      <StyledIncomingText>{t`incoming`}</StyledIncomingText>
    </StyledIncomingCall>
  );
};

export default IncomingCallHeader;
