/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate, useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterAgentAboutForm } from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useFindAllAgents } from '@/settings/service-center/agents/hooks/useFindAllAgents';
import { useUpdateAgent } from '@/settings/service-center/agents/hooks/useUpdateAgent';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterEditAgent = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { agents } = useFindAllAgents();
  const { editAgent } = useUpdateAgent();

  const { agentSlug } = useParams<{ agentSlug?: string }>();

  const activeAgent = agents.find((agent) => agent.id === agentSlug);

  const settingsAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  return (
    <SubMenuTopBarContainer
      title={'Agent'}
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(settingsAgentsPagePath)}
        />
      }
      links={[
        {
          children: 'Edit',
          href: `${settingsAgentsPagePath}`,
        },
        { children: `${agentSlug}` },
      ]}
    >
      <SettingsServiceCenterAgentAboutForm />
    </SubMenuTopBarContainer>
  );
};
