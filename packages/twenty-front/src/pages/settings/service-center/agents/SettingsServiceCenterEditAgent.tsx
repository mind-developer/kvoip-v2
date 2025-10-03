import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsServiceCenterAgentAboutForm from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useEditAgentForm } from '@/settings/service-center/agents/hooks/useEditAgentForm';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterEditAgent = () => {
  const navigate = useNavigate();

  const { records: agents } = useFindManyRecords<
    Agent & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });

  const { agentSlug } = useParams<{ agentSlug?: string }>();

  const activeAgent = agents.find((agent: Agent) => agent.id === agentSlug);

  const { form, onSubmit } = useEditAgentForm(activeAgent);

  const settingsAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  return (
    <SubMenuTopBarContainer
      title={'Agent'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onSave={onSubmit}
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
      <FormProvider {...form}>
        <SettingsServiceCenterAgentAboutForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
