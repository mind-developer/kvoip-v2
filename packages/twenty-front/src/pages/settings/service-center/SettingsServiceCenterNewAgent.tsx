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
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterNewAgent = () => {
  const navigate = useNavigate();

  const { enqueueInfoSnackBar } = useSnackBar();

  const [agent, setAgent] = useState<CreateAgent>({
    isAdmin: false,
    isActive: false,
    sectorId: null,
    workspaceMemberId: null,
    inboxes: null,
  });

  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { createOneRecord: createOneAgent } = useCreateOneRecord<
    Agent & { id: string; __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.Agent });
  const { createOneRecord: createOneInboxTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.InboxTarget,
  });
  const onSave = async () => {
    if (!agent.workspaceMemberId || !agent.workspaceMemberId || !agent.sectorId)
      throw new Error('Could not save agent');
    const createdAgent = await createOneAgent({
      isActive: agent.isActive,
      isAdmin: agent.isActive,
      sectorId: agent.sectorId,
    });

    updateOneRecord({
      idToUpdate: agent.workspaceMemberId,
      updateOneRecordInput: { agentId: createdAgent.id },
    });

    if (createdAgent.id && agent.inboxes && agent.inboxes.length > 0) {
      agent.inboxes.forEach((inboxId) => {
        createOneInboxTarget({
          agentId: createdAgent.id,
          inboxId,
        });
      });
    }

    enqueueInfoSnackBar({ message: `Agent successfully created.` });
    navigate(getSettingsPath(SettingsPath.ServiceCenterAgents));
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
            !agent.workspaceMemberId || !agent.sectorId || !agent.inboxes
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
      <div style={{ overflow: 'visible' }}>
        <SettingsServiceCenterAgentAboutForm
          agent={agent}
          setAgent={setAgent}
        />
      </div>
    </SubMenuTopBarContainer>
  );
};
