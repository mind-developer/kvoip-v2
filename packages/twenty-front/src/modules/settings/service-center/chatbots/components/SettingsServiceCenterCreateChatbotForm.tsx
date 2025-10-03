import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { ChatbotStatus } from '@/service-center/types/ChatbotStatus';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type ChatbotFormValues } from '@/settings/service-center/chatbots/validation-schemas/chatbotFormSchema';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledInfoForm = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsServiceCenterCreateChatbotForm = () => {
  const form = useFormContext<ChatbotFormValues>();

  const { records: inboxes } = useFindManyRecords<
    Inbox & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const inboxOptions: SelectOption[] = inboxes.map((inbox) => ({
    label: inbox.name,
    value: inbox.id,
  }));

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title
          title={t`About`}
          description={t`Create a chatbot and define what inboxes it will answer to. Chatbots in "Draft" or "Disabled" statuses will not answer to any messages. You can change this later.\n\nAfter creating a chatbot, you will be able to design an automated interaction flow for new messages on the previous page.`}
        />
        <StyledInfoForm>
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
                label={t`Status`}
                defaultValue={ChatbotStatus.DRAFT}
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
          <Controller
            name="inboxId"
            control={form.control}
            render={({ field }) => (
              <FormSelectFieldInput
                label={t`Inbox`}
                defaultValue=""
                onChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                options={inboxOptions}
              />
            )}
          />
        </StyledInfoForm>
      </Section>
    </SettingsPageContainer>
  );
};
