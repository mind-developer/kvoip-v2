import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ServiceCenterServiceLevelAgreement } from '@/settings/service-center/service-level/components/ServiceCenterServiceLevelAgreement';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

export const SettingsServiceCenterServiceLevel = () => {
  return (
    <SubMenuTopBarContainer
      title={'Service Level Agreement'}
      links={[
        {
          children: 'Service Center',
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Service Level Agreement' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={''}
            description={'Manage all the service center settings here.'}
          />
          <ServiceCenterServiceLevelAgreement />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
