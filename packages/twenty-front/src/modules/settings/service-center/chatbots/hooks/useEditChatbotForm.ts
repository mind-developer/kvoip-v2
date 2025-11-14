import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
    chatbotFormSchema,
    type ChatbotFormValues,
} from '@/settings/service-center/chatbots/validation-schemas/chatbotFormSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

type Chatbot = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  whatsappIntegrations?: Array<{ id: string; name: string }>;
  whatsappIntegrationIds?: string[];
};

export const useEditChatbotForm = (activeChatbot?: Chatbot) => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { updateOneRecord: updateChatbot } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    recordGqlFields: { id: true, name: true, status: true },
  });

  const { updateOneRecord: updateWhatsappIntegration } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WhatsappIntegration,
    recordGqlFields: { id: true, name: true },
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
  });

  const form = useForm<ChatbotFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      status: 'DRAFT',
      whatsappIntegrationIds: [],
    },
    resolver: zodResolver(chatbotFormSchema),
  });

  useEffect(() => {
    if (activeChatbot) {
      const integrationIds =
        activeChatbot.whatsappIntegrationIds ||
        activeChatbot.whatsappIntegrations?.map((integration) => integration.id) ||
        [];
      form.reset({
        name: activeChatbot.name,
        status: activeChatbot.status,
        whatsappIntegrationIds: integrationIds,
      });
    }
  }, [activeChatbot, form]);

  const onSubmit = async (data: ChatbotFormValues) => {
    if (!activeChatbot) return;

    await updateChatbot({
      idToUpdate: activeChatbot.id,
      updateOneRecordInput: {
        name: data.name,
        status: data.status,
      },
    });

    if (data.whatsappIntegrationIds) {
      for (const whatsappIntegrationId of data.whatsappIntegrationIds) {
        const updatedWhatsappIntegration = await updateWhatsappIntegration({
          idToUpdate: whatsappIntegrationId,
          updateOneRecordInput: { chatbotId: activeChatbot.id },
        });
        enqueueInfoSnackBar({
          message: updatedWhatsappIntegration.id
            ? `Chatbot "${data.name}" added to WhatsApp integration "${updatedWhatsappIntegration.name}"`
            : `Could not add chatbot "${data.name}" to WhatsApp integration "${updatedWhatsappIntegration.name}", please try again`,
        });
      }
    }

    enqueueInfoSnackBar({
      message: `Chatbot "${data.name}" updated successfully`,
    });
    navigate(getSettingsPath(SettingsPath.Chatbots));
  };

  const handleDelete = async () => {
    if (!activeChatbot) return;

    await deleteOneRecord(activeChatbot.id);

    enqueueInfoSnackBar({
      message: `Chatbot ${activeChatbot.name} deleted successfully`,
    });
    navigate(getSettingsPath(SettingsPath.Chatbots));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
  };
};
