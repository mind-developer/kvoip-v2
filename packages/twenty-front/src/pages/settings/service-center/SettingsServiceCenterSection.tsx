import styled from '@emotion/styled';

import { SettingsNavigationCard } from '@/settings/service-center/components/SettingsNavigationCard';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useLingui } from '@lingui/react/macro';
import {
    IconIdBadge2,
    IconPhone,
    IconRobot,
    IconUsers,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';

const StyledCardsContainer = styled.div`
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledUndecoratedLink = styled(UndecoratedLink)`
  box-sizing: border-box;
`;

export const SettingsServiceCenterSection = () => {
  // const { t } = useTranslation();
  const { t } = useLingui();

  return (
    <Section>
      <StyledCardsContainer>
        <StyledUndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterAgents)}
        >
          <SettingsNavigationCard Icon={IconUsers} title={'Agents'}>
            {t`Agents can be assigned to sectors and message inboxes`}
          </SettingsNavigationCard>
        </StyledUndecoratedLink>
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterSectors)}
        >
          <SettingsNavigationCard Icon={IconIdBadge2} title={'Sectors'}>
            {t`Sectors group agents for easier management`}
          </SettingsNavigationCard>
        </UndecoratedLink>
        <UndecoratedLink to={getSettingsPath(SettingsPath.Chatbots)}>
          <SettingsNavigationCard Icon={IconRobot} title={'Chatbots'}>
            {t`Chatbots can be assigned to sectors and chat providers`}
          </SettingsNavigationCard>
        </UndecoratedLink>
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterTelephony)}
        >
          <SettingsNavigationCard Icon={IconPhone} title={'Telephony'}>
            {'Manage your telephony extension settings'}
          </SettingsNavigationCard>
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
