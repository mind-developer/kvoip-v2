import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import {
  newSectorFormSchema,
  type NewSectorFormValues,
} from '@/settings/service-center/sectors/validation-schemas/newSectorFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useNewSectorForm = () => {
  const navigate = useNavigate();
  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { records: existingSectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const { createOneRecord } = useCreateOneRecord<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const form = useForm<NewSectorFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      icon: 'IconIdBadge2',
      abandonmentInterval: 10,
    },
    resolver: zodResolver(newSectorFormSchema),
  });

  const onSubmit = async (data: NewSectorFormValues) => {
    if (
      existingSectors.some(
        (sector) => sector.name.toLowerCase() === data.name.toLowerCase(),
      )
    ) {
      enqueueErrorSnackBar({
        message: t`A sector with this name already exists`,
      });
      return;
    }

    const createdSector = await createOneRecord({
      name: data.name,
      icon: data.icon,
      abandonmentInterval: data.abandonmentInterval,
    });

    if (createdSector.id) {
      navigate(getSettingsPath(SettingsPath.ServiceCenterSectors));
      enqueueInfoSnackBar({
        message: t`Sector ${createdSector.name} created`,
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
