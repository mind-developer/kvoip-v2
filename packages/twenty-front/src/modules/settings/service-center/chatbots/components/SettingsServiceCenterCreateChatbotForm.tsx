import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { ChatbotStatus } from '@/service-center/types/ChatbotStatus';
import { type IWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/WhatsappIntegration';
import { type ChatbotFormValues } from '@/settings/service-center/chatbots/validation-schemas/chatbotFormSchema';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledInfoForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledSection = styled(Section)`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServiceCenterCreateChatbotForm = () => {
  const form = useFormContext<ChatbotFormValues>();
  const { chatbotSlug } = useParams<{ chatbotSlug?: string }>();

  const { records: integrations } = useFindManyRecords<
    IWhatsappIntegration & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WhatsappIntegration,
    recordGqlFields: { id: true, name: true, chatbot: { id: true } },
  });

  const integrationOptions: SelectOption[] = integrations.filter(integration => !integration.chatbot?.id || integration.chatbot?.id === chatbotSlug).map(
    (integration) => ({
      label: integration.name,
      value: integration.id,
    }),
  );

  return (
    <StyledSection>
      <H2Title
        title={t`About`}
        description={t`Create a chatbot and define what integrations it will answer to. Chatbots in "Draft" or "Disabled" statuses will not answer to any messages. You can change this later.\n\n`}
      />
      <StyledInfoForm>
        <StyledFormRow>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <TextInput
                width={200}
                label={t`Name`}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <FormSelectFieldInput
                key={field.value}
                label={t`Status`}
                defaultValue={field.value || ChatbotStatus.DRAFT}
                options={[
                  {
                    label: t`Active`,
                    value: ChatbotStatus.ACTIVE,
                    color: 'green',
                  },
                  {
                    label: t`Draft`,
                    value: ChatbotStatus.DRAFT,
                    color: 'yellow',
                  },
                  {
                    label: t`Disabled`,
                    value: ChatbotStatus.DISABLED,
                    color: 'gray',
                  },
                ]}
                onChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
              />
            )}
          />
        </StyledFormRow>
        <StyledFormRow>
          <Controller
            name="whatsappIntegrationIds"
            control={form.control}
            render={({ field }) => (
              <FormMultiSelectFieldInput
                key={JSON.stringify(field.value)}
                label={t`Connectable Integrations`}
                placeholder={t`Integrations free for connection`}
                defaultValue={field.value || []}
                options={integrationOptions}
                onChange={(value) => {
                  if (value) {
                    field.onChange(typeof value === 'string' ? [value] : value);
                  }
                }}
              />
            )}
          />
        </StyledFormRow>
      </StyledInfoForm>
    </StyledSection>
  );
};
