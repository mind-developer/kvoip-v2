import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  chatbotFormSchema,
  type ChatbotFormValues,
} from '@/settings/service-center/chatbots/validation-schemas/chatbotFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type Chatbot = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  inboxId?: string;
};

export const useEditChatbotForm = (activeChatbot?: Chatbot) => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { updateOneRecord: updateChatbot } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
  });

  const { updateOneRecord: updateInbox } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const form = useForm<ChatbotFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      status: 'DRAFT',
      inboxId: '',
    },
    resolver: zodResolver(chatbotFormSchema),
  });

  useEffect(() => {
    if (activeChatbot) {
      form.reset({
        name: activeChatbot.name,
        status: activeChatbot.status,
        inboxId: activeChatbot.inboxId || '',
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

    if (data.inboxId && data.inboxId !== activeChatbot.inboxId) {
      await updateInbox({
        idToUpdate: data.inboxId,
        updateOneRecordInput: { chatbotId: activeChatbot.id },
      });
    }

    enqueueInfoSnackBar({
      message: `Chatbot ${data.name} updated successfully`,
    });
    navigate(getSettingsPath(SettingsPath.Chatbots));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
