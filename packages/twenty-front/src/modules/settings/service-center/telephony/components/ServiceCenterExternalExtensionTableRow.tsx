/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { SettingsServiceCenterExternalExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterExternalExtension';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
  &:last-child {
    border-bottom: none;
  }feat
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  overflow: auto;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledTextContent = styled.div`
  display: flex;
  align-items: center;
  overflow: auto;
  min-width: 0;
  flex: 1;
`;

const StyledExtensionText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type ServiceCenterExternalExtensionTableRowProps = {
  extension: SettingsServiceCenterExternalExtension;
  accessory?: React.ReactNode;
};

export const ServiceCenterExternalExtensionTableRow = ({
  extension,
  accessory,
}: ServiceCenterExternalExtensionTableRowProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledContent>
        <StyledTextContent>
          <StyledExtensionText> {t`Name`}: </StyledExtensionText>
          <OverflowingTextWithTooltip
            text={extension.nome}
          />
        </StyledTextContent>

        <StyledTextContent>
          <StyledExtensionText> {t`Extension`}: </StyledExtensionText>
          <OverflowingTextWithTooltip
            text={extension.numero}
          />
        </StyledTextContent>

      </StyledContent>
      {accessory}
    </StyledContainer>
  );
};
