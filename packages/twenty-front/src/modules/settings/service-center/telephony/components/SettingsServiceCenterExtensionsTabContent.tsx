/* @kvoip-woulz proprietary */
import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { ServiceCenterExternalExtensionTableRow } from '@/settings/service-center/telephony/components/ServiceCenterExternalExtensionTableRow';
import { SettingsServiceCenterExternalExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterExternalExtension';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { IconUser, useIcons } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

type SettingsServiceCenterExtensionsTabContentProps = {
  extensions: SettingsServiceCenterExternalExtension[];
  refetch: () => void;
};

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServiceCenterExtensionsTabContent = ({
  extensions,
}: SettingsServiceCenterExtensionsTabContentProps) => {
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <>
      <StyledSection>
        {extensions?.map((extension) => (

          <ServiceCenterExternalExtensionTableRow
            key={extension.ramal_id}
            extension={extension}
            accessory={
              <ServiceCenterFieldActionDropdown
                scopeKey={extension.nome ?? extension.numero!}
                // onEdit={() => { 
                  
                // }}
                // onDelete={async () => {
                  
                // }}
                extraMenuItems={[
                  {
                    text: t`Link member`,
                    icon: IconUser,
                    onClick: () => {},
                  },
                ]}
              />
            }
          />
        ))}
      </StyledSection>
    </>
  );
};
