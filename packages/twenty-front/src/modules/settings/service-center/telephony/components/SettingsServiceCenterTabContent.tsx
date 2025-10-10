import { SettingsServiceCenterItemTableRow } from '@/settings/service-center/telephony/components/SettingsServiceCenterItemTableRow';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { 
  AnimatedPlaceholderEmptyTitle, 
  AnimatedPlaceholderEmptyContainer, 
  AnimatedPlaceholder, 
  AnimatedPlaceholderEmptyTextContainer, 
  Section, 
  AnimatedPlaceholderEmptySubTitle 
} from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type ServiceCenterTabContentProps = {
  telephonys: Telephony[];
  refetch: () => void;
};

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const ServiceCenterTabContent = ({
  telephonys,
}: ServiceCenterTabContentProps) => {
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const theme = useTheme();
  const EditTelephonyIcon = getIcon('IconEdit');
  const { t } = useLingui();

  const handleEditTelephony = (telephonyId: string) => {
    const path = getSettingsPath(SettingsPath.EditTelephony).replace(
      ':telephonySlug',
      telephonyId,
    );

    navigate(path);
  };

  return (
    <>
      {telephonys?.length > 0 ? (
          
        <StyledSection>
          {telephonys?.map((telephony) => (
            <SettingsServiceCenterItemTableRow
              key={telephony.id}
              telephony={telephony}
              accessory={
                <IconButton
                  onClick={() => handleEditTelephony(telephony.id)}
                  Icon={() => (
                    <EditTelephonyIcon
                      size={theme.icon.size.md}
                      color={theme.font.color.tertiary}
                    />
                  )}
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
                  {t`No members with extensions found`}
                </AnimatedPlaceholderEmptyTitle>
                <AnimatedPlaceholderEmptySubTitle>
                  {t`Create an extension for a member to get started`}
                </AnimatedPlaceholderEmptySubTitle>
              </AnimatedPlaceholderEmptyTextContainer>
            </AnimatedPlaceholderEmptyContainer>
          </div>
        </Section>
      )}
    </>
  );
};
