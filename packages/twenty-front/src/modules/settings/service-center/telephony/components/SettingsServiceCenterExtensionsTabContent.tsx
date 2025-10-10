/* @kvoip-woulz proprietary */
import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { ServiceCenterExternalExtensionTableRow } from '@/settings/service-center/telephony/components/ServiceCenterExternalExtensionTableRow';
import { SettingsServiceCenterExternalExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterExternalExtension';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { IconUser, useIcons } from 'twenty-ui/display';
import { AnimatedPlaceholder, AnimatedPlaceholderEmptyContainer, AnimatedPlaceholderEmptySubTitle, AnimatedPlaceholderEmptyTextContainer, AnimatedPlaceholderEmptyTitle, Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
      { extensions && extensions?.length > 0 ? (

          <StyledSection>
            {extensions?.map((extension) => (
    
              <ServiceCenterExternalExtensionTableRow
                key={extension.ramal_id}
                extension={extension}
                accessory={
                  <ServiceCenterFieldActionDropdown
                    key={extension.ramal_id}
                    scopeKey={extension.nome ?? extension.numero!}
                    // onDelete={async () => {
                      
                    // }}
                    extraMenuItems={[
                      {
                        text: t`Link member`,
                        icon: IconUser,
                        onClick: () => {
                          navigate(
                            getSettingsPath(SettingsPath.ServiceCenterLinkTelephonyExtension, {
                              extensionNumber: extension.numero!,
                            })
                          );
                        },
                      },
                    ]}
                  />
                }
              />
            ))}
          </StyledSection>

        ) : (

          <Section>
            <div style={{ marginTop: theme.spacing(10) }}>
              <AnimatedPlaceholderEmptyContainer>
                <AnimatedPlaceholder type="noRecord" />
                <AnimatedPlaceholderEmptyTextContainer>
                  <AnimatedPlaceholderEmptyTitle>
                    {t`No extensions found`}
                  </AnimatedPlaceholderEmptyTitle>
                  <AnimatedPlaceholderEmptySubTitle>
                    {t`Create an extension to get started`}
                  </AnimatedPlaceholderEmptySubTitle>
                </AnimatedPlaceholderEmptyTextContainer>
              </AnimatedPlaceholderEmptyContainer>
            </div>
          </Section>
          
        )}
    </>
  );
};
