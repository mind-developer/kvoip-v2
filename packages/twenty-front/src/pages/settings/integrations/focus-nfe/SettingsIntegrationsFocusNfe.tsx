import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { SettingsIntegrationFocusNfeConectionsListCard } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConectionsListCard';
import { SettingsIntegrationFocusNfeIssuersListCard } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeIssuersListCard';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { H2Title } from 'twenty-ui/display';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsIntegrationFocusNfeDatabase = () => {
  const navigateApp = useNavigateApp();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );
  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, isIntegrationAvailable, navigateApp]);

  if (!isIntegrationAvailable) return null;

  return (
    <SubMenuTopBarContainer
      title="Focus NFe"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: 'Focus NFe' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <H2Title
          title="Focus NFe Database"
          description="Connect or access your data"
        />
        <SettingsIntegrationFocusNfeConectionsListCard
          integration={integration}
        />
        <H2Title title="Issuer Registration" />
        <SettingsIntegrationFocusNfeIssuersListCard integration={integration} />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
