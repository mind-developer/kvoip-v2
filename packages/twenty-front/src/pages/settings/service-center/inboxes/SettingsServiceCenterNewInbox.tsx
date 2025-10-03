import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterNewInboxForm } from '@/settings/service-center/inboxes/components/SettingsServiceCenterNewInboxForm';
import { useNewInboxForm } from '@/settings/service-center/inboxes/hooks/useNewInboxForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterNewInbox = () => {
  const settingsServiceCenterInboxesPagePath = getSettingsPath(
    SettingsPath.ServiceCenterInboxes,
  );
  const navigate = useNavigate();
  const { form, onSubmit } = useNewInboxForm();

  return (
    <SubMenuTopBarContainer
      title={'Create inbox'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onCancel={() => navigate(settingsServiceCenterInboxesPagePath)}
          onSave={onSubmit}
        />
      }
      links={[
        {
          children: 'Inboxes',
          href: getSettingsPath(SettingsPath.ServiceCenterInboxes),
        },
        { children: 'New inbox' },
      ]}
    >
      <FormProvider {...form}>
        <SettingsServiceCenterNewInboxForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
