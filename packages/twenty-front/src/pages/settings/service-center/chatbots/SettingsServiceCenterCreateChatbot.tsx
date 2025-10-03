import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterCreateChatbotForm } from '@/settings/service-center/chatbots/components/SettingsServiceCenterCreateChatbotForm';
import { useCreateChatbotForm } from '@/settings/service-center/chatbots/hooks/useCreateChatbotForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export default function SettingsServiceCenterChatbots() {
  const navigate = useNavigate();
  const { form, onSubmit } = useCreateChatbotForm();
  return (
    <SubMenuTopBarContainer
      title={t`Chatbots`}
      links={[
        {
          href: getSettingsPath(SettingsPath.ServiceCenter),
          children: 'Workspace',
        },
        {
          href: getSettingsPath(SettingsPath.ServiceCenter),
          children: 'Service Center',
        },
        {
          href: getSettingsPath(SettingsPath.Chatbots),
          children: 'Chatbots',
        },
        {
          children: 'Create',
        },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onCancel={() => navigate(getSettingsPath(SettingsPath.Chatbots))}
          onSave={onSubmit}
        />
      }
    >
      <FormProvider {...form}>
        <SettingsServiceCenterCreateChatbotForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
}
