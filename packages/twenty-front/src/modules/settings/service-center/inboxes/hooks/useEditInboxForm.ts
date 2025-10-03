import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import {
  newInboxFormSchema,
  type NewInboxFormValues,
} from '@/settings/service-center/inboxes/validation-schemas/newInboxFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useEditInboxForm = (activeInbox?: Inbox) => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { updateOneRecord } = useUpdateOneRecord<Inbox>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const form = useForm<NewInboxFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      icon: 'IconInbox',
      whatsappIntegrationId: null,
    },
    resolver: zodResolver(newInboxFormSchema),
  });

  useEffect(() => {
    if (activeInbox) {
      form.reset({
        name: activeInbox.name,
        icon: activeInbox.icon,
        whatsappIntegrationId: null, // WhatsApp integration is handled separately
      });
    }
  }, [activeInbox, form]);

  const onSubmit = async (data: NewInboxFormValues) => {
    if (!activeInbox) return;

    await updateOneRecord({
      idToUpdate: activeInbox.id,
      updateOneRecordInput: {
        name: data.name,
        icon: data.icon,
      },
    });

    enqueueInfoSnackBar({
      message: t`Inbox ${data.name} updated successfully`,
    });
    navigate(getSettingsPath(SettingsPath.ServiceCenterInboxes));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
