import styled from '@emotion/styled';

import { SettingsNavigationCard } from '@/settings/service-center/components/SettingsNavigationCard';
import { SettingsPath } from '@/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
// eslint-disable-next-line no-restricted-imports
import { useLingui } from '@lingui/react/macro';
import {
  IconIdBadge2,
  IconMailCog,
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
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterServiceLevel)}
        >
          <SettingsNavigationCard Icon={IconMailCog} title={'Service Level'}>
            {'Set the maximum response time for customer support in minutes.'}
          </SettingsNavigationCard>
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
