/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { IconSettings } from 'twenty-ui/display';
import { SoftphoneStatus } from '../../constants/enum/SoftphoneStatus';
import StatusIndicator from '../ui/StatusPill';

const StyledStatusAndTimer = styled.div`
  align-items: center;
  justify-content: space-between;
  display: flex;
  width: 100%;
`;

const StyledSettingsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.secondary};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

interface ConnectionStatusProps {
  status: SoftphoneStatus;
  extension?: string;
  onOpenSettings: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  extension,
  onOpenSettings
}) => {
  const theme = useTheme();

  return (
    <StyledStatusAndTimer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusIndicator
          status={status}
          extension={extension}
        />
        <StyledSettingsButton onClick={onOpenSettings}>
          <IconSettings size={theme.icon.size.md} />
        </StyledSettingsButton>
      </div>
    </StyledStatusAndTimer>
  );
};
