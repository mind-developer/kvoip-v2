import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import {
  agentFormSchema,
  type AgentFormValues,
} from '@/settings/service-center/agents/validation-schemas/agentFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useNewAgentForm = () => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { createOneRecord: createOneAgent } = useCreateOneRecord<
    Agent & { id: string; __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.Agent });

  const form = useForm<AgentFormValues>({
    mode: 'onChange',
    defaultValues: {
      workspaceMemberId: '',
      sectorId: '',
    },
    resolver: zodResolver(agentFormSchema),
  });

  const onSubmit = async (data: AgentFormValues) => {
    const createdAgent = await createOneAgent({
      sectorId: data.sectorId,
    });

    await updateOneRecord({
      idToUpdate: data.workspaceMemberId,
      updateOneRecordInput: { agentId: createdAgent.id },
    });

    enqueueInfoSnackBar({ message: `Agent successfully created.` });
    navigate(getSettingsPath(SettingsPath.ServiceCenterAgents));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
