import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledInfoForm = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export default function SettingsServiceCenterChatbots() {
  const chatbots = useFindManyRecords({ objectNameSingular: 'chatbot' });
  const navigate = useNavigate();
  console.log(chatbots);
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
            <TextInput label="Name" />
            <Select
              label="Status"
              options={[
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'DRAFT', value: 'DRAFT' },
                { label: 'DISABLED', value: 'DISABLED' },
              ]}
              dropdownId="39pg8"
            />
            <TextInput label="Name" />
          </StyledInfoForm>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
