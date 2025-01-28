import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';
import { Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAccountsCalendars = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('calendars')}
      links={[
        {
          children: t('user'),
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t('account'),
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t('calendars') },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
