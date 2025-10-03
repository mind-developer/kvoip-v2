import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterNewInboxForm } from '@/settings/service-center/inboxes/components/SettingsServiceCenterNewInboxForm';
import { useEditInboxForm } from '@/settings/service-center/inboxes/hooks/useEditInboxForm';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterEditInbox = () => {
  const navigate = useNavigate();
  const { t } = useLingui();

  const { records: inboxes } = useFindManyRecords<
    Inbox & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const { inboxSlug } = useParams<{ inboxSlug?: string }>();

  const activeInbox = inboxes.find((inbox) => inbox.id === inboxSlug);

  const { form, onSubmit } = useEditInboxForm(activeInbox);

  return (
    <SubMenuTopBarContainer
      title={t`Edit Inbox`}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onSave={onSubmit}
          onCancel={() =>
            navigate(getSettingsPath(SettingsPath.ServiceCenterInboxes))
          }
        />
      }
      links={[
        {
          href: getSettingsPath(SettingsPath.ServiceCenter),
          children: t`Service Center`,
        },
        {
          href: getSettingsPath(SettingsPath.ServiceCenterInboxes),
          children: t`Inboxes`,
        },
        {
          children: t`Edit`,
        },
      ]}
    >
      <FormProvider {...form}>
        <SettingsServiceCenterNewInboxForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
