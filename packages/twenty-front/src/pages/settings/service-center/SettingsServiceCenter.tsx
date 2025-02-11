import { H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsServiceCenterSection } from '~/pages/settings/service-center/SettingsServiceCenterSection';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenter = () => {
  return (
    <SubMenuTopBarContainer
      title={'Service Center'}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: 'Service Center' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={''}
            description={'Manage all agents and sectors here.'}
          />

          <SettingsServiceCenterSection />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
