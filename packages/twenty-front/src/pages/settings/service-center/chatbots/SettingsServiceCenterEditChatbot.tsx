import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsServiceCenterCreateChatbotForm } from '@/settings/service-center/chatbots/components/SettingsServiceCenterCreateChatbotForm';
import { useEditChatbotForm } from '@/settings/service-center/chatbots/hooks/useEditChatbotForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type Chatbot = {
  __typename: 'Chatbot';
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  inboxId?: string;
};

export const SettingsServiceCenterEditChatbot = () => {
  const navigate = useNavigate();

  const { records: chatbots } = useFindManyRecords<Chatbot>({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
  });

  const { chatbotSlug } = useParams<{ chatbotSlug?: string }>();

  const activeChatbot = chatbots.find((chatbot) => chatbot.id === chatbotSlug);

  const { form, onSubmit } = useEditChatbotForm(activeChatbot);

  return (
    <SubMenuTopBarContainer
      title={t`Edit Chatbot`}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onSave={onSubmit}
          onCancel={() => navigate(getSettingsPath(SettingsPath.Chatbots))}
        />
      }
      links={[
        {
          href: getSettingsPath(SettingsPath.ServiceCenter),
          children: 'Service Center',
        },
        {
          href: getSettingsPath(SettingsPath.Chatbots),
          children: 'Chatbots',
        },
        {
          children: 'Edit',
        },
      ]}
    >
      <FormProvider {...form}>
        <SettingsServiceCenterCreateChatbotForm />
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
