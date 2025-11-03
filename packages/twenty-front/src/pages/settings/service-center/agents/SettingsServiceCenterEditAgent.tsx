import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import SettingsServiceCenterAgentAboutForm from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useEditAgentForm } from '@/settings/service-center/agents/hooks/useEditAgentForm';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { type WorkspaceMember } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const DELETE_AGENT_MODAL_ID = 'delete-agent-modal';

export const SettingsServiceCenterEditAgent = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { agentSlug } = useParams<{ agentSlug?: string }>();

  const activeWorkspaceMember = workspaceMembers.find(
    (member) => member.agentId === agentSlug,
  );

  const { form, onSubmit, handleDelete } = useEditAgentForm(
    activeWorkspaceMember,
  );

  const settingsAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  return (
    <>
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
            href: getSettingsPath(SettingsPath.ServiceCenter),
            children: 'Service Center',
          },
          {
            href: getSettingsPath(SettingsPath.ServiceCenterAgents),
            children: 'Agents',
          },
          {
            children: 'Edit',
          },
        ]}
      >
        <FormProvider {...form}>
          <SettingsPageContainer>
            <SettingsServiceCenterAgentAboutForm isEditMode={true} />
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this agent`}
              />
              <Button
                accent="danger"
                onClick={() => openModal(DELETE_AGENT_MODAL_ID)}
                variant="secondary"
                size="small"
                title={t`Delete agent`}
              />
            </Section>
          </SettingsPageContainer>
        </FormProvider>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalId={DELETE_AGENT_MODAL_ID}
        title={t`Delete agent`}
        subtitle={t`Delete this agent?`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
