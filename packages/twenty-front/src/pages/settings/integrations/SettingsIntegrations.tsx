import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationGroup } from '@/settings/integrations/components/SettingsIntegrationGroup';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsIntegrations = () => {
  const integrationCategories = useSettingsIntegrationCategories();

  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title="Integrations"
      links={[
        {
          children: "Workspace",
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: 'Integrations' },
      ]}
    >
      <SettingsPageContainer>
        {integrationCategories.map((group) => (
          <SettingsIntegrationGroup key={group.key} integrationGroup={group} />
        ))}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
