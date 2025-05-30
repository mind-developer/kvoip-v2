import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConectionsListCard } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConectionsListCard';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsIntegrationWhatsappDatabase = () => {
  const navigateApp = useNavigateApp();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
  );

  const { refetchWhatsapp } = useFindAllWhatsappIntegrations();

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, isIntegrationAvailable, navigateApp]);

  useEffect(() => {
    refetchWhatsapp();
  }, [refetchWhatsapp]);

  if (!isIntegrationAvailable) return null;

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
