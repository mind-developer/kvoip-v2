import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConectionsListCard } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConectionsListCard';
import { AppPath } from '@/types/AppPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SettingsIntegrationWhatsappDatabase = () => {
  const navigateApp = useNavigateApp();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
  );

  useEffect(() => {
    if (!integration) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, navigateApp]);

  if (!integration) return null;

  return (
    <SubMenuTopBarContainer
      title="Whatsapp"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: 'Whatsapp' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <SettingsIntegrationWhatsappDatabaseConectionsListCard
          integration={integration}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
