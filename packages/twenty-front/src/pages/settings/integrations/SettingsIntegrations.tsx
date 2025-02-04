import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationGroup } from '@/settings/integrations/components/SettingsIntegrationGroup';
import { SettigsIntegrationStripeConnectionsListCard } from '@/settings/integrations/database-connection/components/SettigsIntegrationStripeConnectionsListCard';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsIntegrations = () => {
  const integrationCategories = useSettingsIntegrationCategories();

  const filteredIntegrationCategories = integrationCategories.filter(
    (group) => group.key !== 'stripe',
  );

  return (
    <SubMenuTopBarContainer
      title="Integrations"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Integrations' },
      ]}
    >
      <SettingsPageContainer>
        {filteredIntegrationCategories.map((group) => (
          <SettingsIntegrationGroup key={group.key} integrationGroup={group} />
        ))}

        <SettigsIntegrationStripeConnectionsListCard />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
