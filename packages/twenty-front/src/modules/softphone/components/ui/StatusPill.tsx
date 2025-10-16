/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { SoftphoneStatus, useSoftphoneStatusTranslations } from '../../constants/SoftphoneStatus';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatusWrapper = styled.div<{ status: SoftphoneStatus }>`
  align-items: center;
  background-color: ${({ status, theme }) =>
    status === SoftphoneStatus.Online
      ? theme.color.green20
      : status === SoftphoneStatus.Registering
        ? theme.color.yellow20
        : theme.color.red20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ status, theme }) =>
    status === SoftphoneStatus.Online
      ? theme.color.green60
      : status === SoftphoneStatus.Registering
        ? theme.color.yellow60
        : theme.color.red60};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  width: fit-content;
`;

const StyledStatusCircle = styled.div<{ status: SoftphoneStatus }>`
  background-color: ${({ status, theme }) =>
    status === SoftphoneStatus.Online
      ? theme.color.green60
      : status === SoftphoneStatus.Registering
        ? theme.color.yellow60
        : theme.color.red60};
  border-radius: 50%;
  height: 6px;
  width: 6px;
`;

const StatusIndicator = ({
  status,
  extension,
}: {
  status: SoftphoneStatus;
  extension?: string;
}) => {
  const { getStatusLabel } = useSoftphoneStatusTranslations();
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledStatusWrapper status={status}>
        <StyledStatusCircle status={status} />
        {getStatusLabel(status)}
      </StyledStatusWrapper>
      {extension && <span style={{ color: theme.font.color.tertiary }}>{extension}</span>}
    </StyledContainer>
  );
};

export default StatusIndicator;
