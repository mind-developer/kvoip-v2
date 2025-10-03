import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import {
  agentFormSchema,
  type AgentFormValues,
} from '@/settings/service-center/agents/validation-schemas/agentFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useEditAgentForm = (activeAgent?: Agent) => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { updateOneRecord } = useUpdateOneRecord<Agent>({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });

  const form = useForm<AgentFormValues>({
    mode: 'onChange',
    defaultValues: {
      workspaceMemberId: '',
      sectorId: '',
      inboxes: [],
      isAdmin: false,
      isActive: false,
    },
    resolver: zodResolver(agentFormSchema),
  });

  useEffect(() => {
    if (activeAgent) {
      form.reset({
        workspaceMemberId: '', // This would come from the agent's workspace member relation
        sectorId: activeAgent.sectorId || '',
        inboxes: [], // This would need to be fetched from inbox targets
        isAdmin: activeAgent.isAdmin,
        isActive: activeAgent.isActive || false,
      });
    }
  }, [activeAgent, form]);

  const onSubmit = async (data: AgentFormValues) => {
    if (!activeAgent) return;

    await updateOneRecord({
      idToUpdate: activeAgent.id,
      updateOneRecordInput: {
        isAdmin: data.isAdmin,
        isActive: data.isActive,
        sectorId: data.sectorId,
      },
    });

    enqueueInfoSnackBar({
      message: `Agent updated successfully`,
    });
    navigate(getSettingsPath(SettingsPath.ServiceCenterAgents));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
