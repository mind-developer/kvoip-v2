
import { SettingsDataRoleOverview } from '@/settings/roles/graph-overview/SettingsDataRoleOverview';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ReactFlowProvider } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRolesOverview = () => {
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer 
    links={[
      {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
      },
      {
        children: 'Roles',
        href: getSettingsPath(SettingsPath.MembersRoles),
      },
      ]} 
      title={""}
    >
      <ReactFlowProvider>
        <SettingsDataRoleOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};