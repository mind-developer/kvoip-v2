import { FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServiceCenterCreateChatbotForm } from '@/settings/service-center/chatbots/components/SettingsServiceCenterCreateChatbotForm';
import { useEditChatbotForm } from '@/settings/service-center/chatbots/hooks/useEditChatbotForm';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const DELETE_CHATBOT_MODAL_ID = 'delete-chatbot-modal';

type Chatbot = {
  __typename: 'Chatbot';
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  whatsappIntegrationIds?: string[];
};

export const SettingsServiceCenterEditChatbot = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const { records: chatbots } = useFindManyRecords<Chatbot>({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
  });

  const { chatbotSlug } = useParams<{ chatbotSlug?: string }>();

  const activeChatbot = chatbots.find((chatbot) => chatbot.id === chatbotSlug);

  const { form, onSubmit, handleDelete } = useEditChatbotForm(activeChatbot);

  return (
    <>
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
          <SettingsPageContainer>
            <SettingsServiceCenterCreateChatbotForm />
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this chatbot`}
              />
              <Button
                accent="danger"
                onClick={() => openModal(DELETE_CHATBOT_MODAL_ID)}
                variant="secondary"
                size="small"
                title={t`Delete chatbot`}
              />
            </Section>
          </SettingsPageContainer>
        </FormProvider>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalId={DELETE_CHATBOT_MODAL_ID}
        title={t`Delete chatbot`}
        subtitle={t`Delete this chatbot?`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
