import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { ChatbotStatus } from '@/service-center/types/ChatbotStatus';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Inbox } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledInfoForm = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export default function SettingsServiceCenterChatbots() {
  const inboxes = useFindManyRecords<Inbox>({
    objectNameSingular: 'inbox',
  }).records;

  const [selectedInboxes, setSelectedInboxes] = useState<Inbox[] | null>(null);
  const [status, setStatus] = useState<string | null>('ACTIVE');

  const inboxOptions = inboxes.map(
    (inbox) =>
      ({
        label: inbox.name,
        value: inbox.id,
      }) as SelectOption,
  );
  const navigate = useNavigate();
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
          onCancel={() => navigate(getSettingsPath(SettingsPath.Chatbots))}
          onSave={() => {}}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`About`}
            description={t`
              Create a chatbot and define what inboxes it will answer to. Chatbots in "Draft" or "Disabled" statuses will not answer to any messages. You can change this later.\n\nAfter creating a chatbot, you will be able to design an automated interaction flow for new messages on the previous page.`}
          />
          <StyledInfoForm>
            <TextInput width={200} label="Name" />
            <FormSelectFieldInput
              label="Status"
              defaultValue={ChatbotStatus.ACTIVE}
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
              onChange={(s) => {
                setStatus(s);
              }}
            />
            <FormSelectFieldInput
              label="Inbox"
              defaultValue=""
              onChange={() => {}}
              options={inboxOptions}
            />
          </StyledInfoForm>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
