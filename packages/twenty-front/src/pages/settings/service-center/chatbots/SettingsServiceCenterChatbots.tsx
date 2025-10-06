import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconPlus, IconRobot } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Tag, type TagColor } from 'twenty-ui/components';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Section,
} from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type Chatbot = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
};

const getChatbotStatusTagProps = (
  status: Chatbot['status'],
): { color: TagColor; text: string } => {
  switch (status) {
    case 'ACTIVE':
      return { color: 'green', text: 'Active' };
    case 'DRAFT':
      return { color: 'yellow', text: 'Draft' };
    case 'DISABLED':
      return { color: 'gray', text: 'Disabled' };
    default:
      return { color: 'gray', text: status };
  }
};

const StyledSettingsCard = styled(SettingsCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTag = styled(Tag)`
  min-width: ${({ theme }) => theme.spacing(10)};
  justify-content: center;
`;

export default function SettingsServiceCenterChatbots() {
  const theme = useTheme();
  const { t } = useLingui();
  const navigate = useNavigate();
  const { records: chatbots } = useFindManyRecords<
    Chatbot & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
  });
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
            description={t`Chatbots will automatically answer messages as soon as they reach their assigned integrations. Chats already in attendance will be ignored.`}
          />
          {chatbots.map((chatbot) => {
            const statusProps = getChatbotStatusTagProps(chatbot.status);
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <StyledSettingsCard
                  key={chatbot.id}
                  title={chatbot.name}
                  Status={
                    <>
                      <StyledTag
                        color={statusProps.color}
                        text={statusProps.text}
                      />
                    </>
                  }
                  Icon={<IconRobot size={18} />}
                  onClick={() => {
                    navigate(
                      getSettingsPath(SettingsPath.ChatbotsEdit, {
                        chatbotSlug: chatbot.id,
                      }),
                    );
                  }}
                />
              </div>
            );
          })}
          {chatbots.length === 0 && (
            <Section>
              <div style={{ marginTop: theme.spacing(10) }}>
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      {t`No chatbots found`}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      {t`Create a chatbot to get started`}
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                </AnimatedPlaceholderEmptyContainer>
              </div>
            </Section>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
