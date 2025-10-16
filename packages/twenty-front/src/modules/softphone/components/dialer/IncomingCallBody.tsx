/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

const StyledIncomingNumber = styled.span`
  align-self: start;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledIncomingButtonContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledIncomingButton = styled.div<{ accept: boolean }>`
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ accept, theme }) =>
    accept ? theme.color.green60 : theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background-color: ${({ accept, theme }) =>
      accept ? theme.color.green70 : theme.color.red50};
  }
`;

interface IncomingCallBodyProps {
  incomingCallNumber: string;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallBody: React.FC<IncomingCallBodyProps> = ({
  incomingCallNumber,
  onAccept,
  onReject,
}) => {
  const { t } = useLingui();

  return (
    <>
      <StyledIncomingNumber>
        {incomingCallNumber}
      </StyledIncomingNumber>
      <StyledIncomingButtonContainer>
        <StyledIncomingButton accept={false} onClick={onReject}>
          {t`Reject`}
        </StyledIncomingButton>
        <StyledIncomingButton accept={true} onClick={onAccept}>
          {t`Accept`}
        </StyledIncomingButton>
      </StyledIncomingButtonContainer>
    </>
  );
};

export default IncomingCallBody;
