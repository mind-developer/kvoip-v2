import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
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
          <H2Title title="Create a chatbot" />
          <StyledInfoForm>
            <TextInput width={200} label="Name" />
            <FormSelectFieldInput
              label="Status"
              defaultValue="ACTIVE"
              options={[
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'DRAFT', value: 'DRAFT' },
                { label: 'DISABLED', value: 'DISABLED' },
              ]}
              onChange={() => {}}
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
