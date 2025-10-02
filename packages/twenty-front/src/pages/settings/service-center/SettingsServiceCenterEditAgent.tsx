/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterAgentAboutForm } from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterEditAgent = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { records: agents } = useFindManyRecords<Agent & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });

  const { agentSlug } = useParams<{ agentSlug?: string }>();

  const activeAgent = agents.find((agent: Agent) => agent.id === agentSlug);

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
