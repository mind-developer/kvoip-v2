import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { IconPlus } from '@tabler/icons-react';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export default function SettingsServiceCenterChatbots() {
  const chatbots = useFindManyRecords({ objectNameSingular: 'chatbot' });
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
        { children: 'Chatbots' },
      ]}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.ChatbotsCreate)}>
          <Button
            Icon={IconPlus}
            title="Add chatbot"
            type="submit"
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Chatbots" description={'Manage all chatbots here.'} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
