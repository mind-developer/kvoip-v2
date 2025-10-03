import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import {
  newInboxFormSchema,
  type NewInboxFormValues,
} from '@/settings/service-center/inboxes/validation-schemas/newInboxFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useNewInboxForm = () => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { records: existingInboxes } = useFindManyRecords<
    Inbox & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Inbox,
    recordGqlFields: { id: true },
  });

  const { createOneRecord } = useCreateOneRecord<
    Inbox & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Inbox,
    recordGqlFields: { id: true },
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

  const onSubmit = async (data: NewInboxFormValues) => {
    if (
      existingInboxes.some(
        (inbox) => inbox.name.toLowerCase() === data.name.toLowerCase(),
      )
    ) {
      enqueueErrorSnackBar({
        message: t`An inbox with this name already exists`,
      });
      return;
    }

    const createdInbox = await createOneRecord({
      name: data.name,
      icon: data.icon,
      whatsappIntegrationId: data.whatsappIntegrationId,
    });

    if (createdInbox.id) {
      navigate(getSettingsPath(SettingsPath.ServiceCenterInboxes));
      enqueueInfoSnackBar({
        message: t`Inbox ${createdInbox.name} created`,
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
