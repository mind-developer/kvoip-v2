import styled from '@emotion/styled';
import { IconPhone, IconUsers, Section, UndecoratedLink } from 'twenty-ui';

import { SettingsNavigationCard } from '@/settings/service-center/components/SettingsNavigationCard';
import { SettingsPath } from '@/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
// eslint-disable-next-line no-restricted-imports
import { IconIdBadge2 } from '@tabler/icons-react';

const StyledCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledUndecoratedLink = styled(UndecoratedLink)`
  box-sizing: border-box;
`;

export const SettingsServiceCenterSection = () => {
  // const { t } = useTranslation();

  return (
    <Section>
      <StyledCardsContainer>
        <StyledUndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterAgents)}
        >
          <SettingsNavigationCard Icon={IconUsers} title={'Agents'}>
            {'Create, edit, delete, and view agents and more.'}
          </SettingsNavigationCard>
        </StyledUndecoratedLink>
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterSectors)}
        >
          <SettingsNavigationCard Icon={IconIdBadge2} title={'Sectors'}>
            {'Create, edit, delete, and view agents and more.'}
          </SettingsNavigationCard>
        </UndecoratedLink>
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterTelephony)}
        >
          <SettingsNavigationCard Icon={IconPhone} title={'Telephony'}>
            {'Manage your telephony extension settings here.'}
          </SettingsNavigationCard>
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
