import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterNewSectorForm } from '@/settings/service-center/sectors/components/SettingsServiceCenterNewSectorForm';
import { useNewSectorForm } from '@/settings/service-center/sectors/hooks/useNewSectorForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { FormProvider } from 'react-hook-form';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterNewSector = () => {
  const settingsServiceCenterSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );
  const navigate = useNavigate();
  const { form, onSubmit } = useNewSectorForm();

  return (
    <SubMenuTopBarContainer
      title={'Create sector'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onCancel={() => navigate(settingsServiceCenterSectorsPagePath)}
          onSave={onSubmit}
        />
      }
      links={[
        {
          children: 'Sectors',
          href: getSettingsPath(SettingsPath.ServiceCenterSectors),
        },
        { children: 'New sector' },
      ]}
    >
      <FormProvider {...form}>
        <SettingsServiceCenterNewSectorForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
