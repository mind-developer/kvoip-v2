import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  chatbotFormSchema,
  type ChatbotFormValues,
} from '@/settings/service-center/chatbots/validation-schemas/chatbotFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useCreateChatbotForm = () => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { createOneRecord: createChatbot } = useCreateOneRecord({
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

  const onSubmit = async (data: ChatbotFormValues) => {
    const createdChatbot = await createChatbot({
      name: data.name,
      status: data.status,
    });

    if (createdChatbot.id) {
      await updateInbox({
        idToUpdate: data.inboxId,
        updateOneRecordInput: { chatbotId: createdChatbot.id },
      });

      enqueueInfoSnackBar({
        message: `Chatbot ${createdChatbot.name} created successfully`,
      });
      navigate(getSettingsPath(SettingsPath.Chatbots));
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
