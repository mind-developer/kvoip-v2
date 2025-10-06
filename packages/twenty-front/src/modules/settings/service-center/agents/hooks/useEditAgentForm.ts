import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import {
  agentFormSchema,
  type AgentFormValues,
} from '@/settings/service-center/agents/validation-schemas/agentFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';
import { WorkspaceMember } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useEditAgentForm = (activeWorkspaceMember?: WorkspaceMember) => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });

  const { record: agent } = useFindOneRecord<Agent & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Agent,
    objectRecordId: activeWorkspaceMember?.agentId,
  });

  const form = useForm<AgentFormValues>({
    mode: 'onChange',
    defaultValues: {
      workspaceMemberId: activeWorkspaceMember?.id,
      sectorId: agent?.sectorId || '',
    },
    resolver: zodResolver(agentFormSchema),
  });

  useEffect(() => {
    if (activeWorkspaceMember) {
      form.reset({
        workspaceMemberId: activeWorkspaceMember.id,
        sectorId: agent?.sectorId || '',
      });
    }
  }, [activeWorkspaceMember, agent, form]);

  const onSubmit = async (data: AgentFormValues) => {
    if (!activeWorkspaceMember?.agentId) return;

    await updateOneRecord({
      idToUpdate: activeWorkspaceMember.agentId,
      updateOneRecordInput: {
        sectorId: data.sectorId,
      },
    });

    enqueueInfoSnackBar({
      message: `Agent updated successfully`,
    });
    navigate(getSettingsPath(SettingsPath.ServiceCenterAgents));
  };

  const handleDelete = async () => {
    if (!activeWorkspaceMember?.agentId) return;

    await deleteOneRecord(activeWorkspaceMember.agentId);

    enqueueInfoSnackBar({
      message: `Agent deleted successfully`,
    });
    navigate(getSettingsPath(SettingsPath.ServiceCenterAgents));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
  };
};
