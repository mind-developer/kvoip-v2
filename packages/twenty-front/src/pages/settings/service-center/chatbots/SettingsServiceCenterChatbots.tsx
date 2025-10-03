import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from '@tabler/icons-react';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export default function SettingsServiceCenterChatbots() {
  const { t } = useLingui();
  return (
    <SubMenuTopBarContainer
      title={t`Chatbots`}
      links={[
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
          <H2Title
            title={t`Manage chatbots`}
            description={t`Chatbots will automatically answer messages as soon as they reach their assigned inboxes. Chats already in attendance will be ignored.`}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
