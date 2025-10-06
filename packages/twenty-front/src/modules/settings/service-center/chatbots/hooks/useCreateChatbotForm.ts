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
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useCreateChatbotForm = () => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();
  const { t } = useLingui();
  const { createOneRecord: createChatbot } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    recordGqlFields: { id: true, name: true },
  });

  const { updateOneRecord: updateWhatsappIntegration } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WhatsappIntegration,
    recordGqlFields: { id: true, name: true },
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

  const onSubmit = async (data: ChatbotFormValues) => {
    const createdChatbot = await createChatbot({
      name: data.name,
      status: data.status,
    });

    if (createdChatbot.id && data.whatsappIntegrationIds) {
      for (const whatsappIntegrationId of data.whatsappIntegrationIds) {
        const updatedWhatsappIntegration = await updateWhatsappIntegration({
          idToUpdate: whatsappIntegrationId,
          updateOneRecordInput: { chatbotId: createdChatbot.id },
        });
        enqueueInfoSnackBar({
          message: updatedWhatsappIntegration.id
            ? t`Chatbot "${createdChatbot.name}" created and linked to "${data.whatsappIntegrationIds.join(', ')}"`
            : t`Could not link chatbot "${createdChatbot.name}" to WhatsApp integration "${updatedWhatsappIntegration.name}", please try again`,
        });
      }
      navigate(getSettingsPath(SettingsPath.Chatbots));
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
