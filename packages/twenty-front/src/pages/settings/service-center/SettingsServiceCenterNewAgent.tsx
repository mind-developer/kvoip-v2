/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';

import { SettingsPath } from '@/types/SettingsPath';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  Agent,
  CreateAgent,
} from '@/settings/service-center/agents/types/Agent';
import SettingsServiceCenterAgentAboutForm from '@/settings/workspace_service-center/SettingsServiceCenterAgentAboutForm';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterNewAgent = () => {
  const navigate = useNavigate();

  const [agent, setAgent] = useState<CreateAgent>({
    isAdmin: false,
    isActive: false,
    sectorId: null,
    workspaceMemberId: null,
    inboxId: null,
  });

  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { createOneRecord } = useCreateOneRecord<
    Agent & { id: string; __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.Agent });
  const onSave = async () => {
    if (!agent.workspaceMemberId || !agent.workspaceMemberId || !agent.sectorId)
      throw new Error('Could not save agent');
    const createdAgent = await createOneRecord({
      isActive: agent.isActive,
      isAdmin: agent.isActive,
      sectorId: agent.sectorId,
    });

    updateOneRecord({
      idToUpdate: agent.workspaceMemberId,
      updateOneRecordInput: { agentId: createdAgent.id },
    });
  };

  const settingsServiceCenterAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  return (
    <SubMenuTopBarContainer
      title={t`Create agent`}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={
            !agent.workspaceMemberId || !agent.sectorId || !agent.inboxId
          }
          onSave={onSave}
          onCancel={() => navigate(settingsServiceCenterAgentsPagePath)}
        />
      }
      links={[
        {
          children: 'Agents',
          href: getSettingsPath(SettingsPath.ServiceCenterAgents),
        },
        { children: 'New Agent' },
      ]}
    >
      <Section>
        <SettingsServiceCenterAgentAboutForm
          agent={agent}
          setAgent={setAgent}
        />
      </Section>
    </SubMenuTopBarContainer>
  );
};
