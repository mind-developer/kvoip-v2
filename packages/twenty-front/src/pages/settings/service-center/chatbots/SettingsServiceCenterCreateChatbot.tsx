import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServiceCenterCreateChatbotForm } from '@/settings/service-center/chatbots/components/SettingsServiceCenterCreateChatbotForm';
import { useCreateChatbotForm } from '@/settings/service-center/chatbots/hooks/useCreateChatbotForm';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowUpRight, IconInfoCircle } from '@tabler/icons-react';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Chip, ChipAccent } from 'twenty-ui/components';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';

const StyledChip = styled(Chip)`
  margin-bottom: ${({ theme }) => theme.spacing(4)} !important;
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

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
      <SettingsPageContainer>
        <FormProvider {...form}>
          <SettingsServiceCenterCreateChatbotForm />
          <Section>
            <H2Title
              adornment={<IconInfoCircle style={{ marginLeft: 8 }} size={16} />}
              title="Connect to a chat provider"
              description="If you haven't set up an integration with a chat provider yet, you'll need to create one to connect your chatbot to it."
            />
            <UndecoratedLink to={getSettingsPath(SettingsPath.Integrations)}>
              <StyledChip
                accent={ChipAccent.TextPrimary}
                leftComponent={<IconArrowUpRight size={12} />}
                label={t`Integrations`}
              />
            </UndecoratedLink>
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
