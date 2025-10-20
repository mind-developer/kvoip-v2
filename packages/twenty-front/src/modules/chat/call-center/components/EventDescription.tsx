import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowRight, IconRobot } from '@tabler/icons-react';
import { ClientChatMessage, ClientChatMessageEvent } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/display';
import { WorkspaceMember } from '~/generated/graphql';

export default function EventDescription({
  message,
}: {
  message: ClientChatMessage;
}) {
  switch (message.event) {
    case ClientChatMessageEvent.START:
      return <StartEndDescription message={message} />;
    case ClientChatMessageEvent.END:
      return <StartEndDescription message={message} />;
    case ClientChatMessageEvent.TRANSFER_TO_AGENT:
      return <TransferToAgentDescription message={message} />;
    case ClientChatMessageEvent.TRANSFER_TO_SECTOR:
      return <TransferToSectorDescription message={message} />;
    case ClientChatMessageEvent.ONHOLD:
      return <p>{t`Service placed on hold`}</p>;
    case ClientChatMessageEvent.CHATBOT_START:
      return <ChatbotDescription message={message} />;
    case ClientChatMessageEvent.CHATBOT_END:
      return <ChatbotDescription message={message} />;
  }
}

const StyledEventDescription = styled.p`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  margin: 0;
`;

const StyledEventDescriptionText = styled.p<{ variant?: 'bold' }>`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme, variant }) =>
    variant === 'bold' ? theme.font.weight.medium : theme.font.weight.regular};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

function TransferToAgentDescription({
  message,
}: {
  message: ClientChatMessage;
}) {
  const { records: agentWorkspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string; agent: { id: string } }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      name: true,
      agent: true,
      avatarUrl: true,
    },
    filter: {
      or: [
        {
          agentId: {
            eq: message.from,
          },
        },
        {
          agentId: {
            eq: message.to,
          },
        },
      ],
    },
  });
  const from = agentWorkspaceMembers.find(
    (member) => member.agent?.id === message.from,
  );
  const to = agentWorkspaceMembers.find(
    (member) => member.agent?.id === message.to,
  );
  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        {t`Service transferred to agent:`}
      </StyledEventDescriptionText>
      <StyledEventDescriptionText>
        <Avatar
          avatarUrl={from?.avatarUrl}
          placeholder={from?.name?.firstName}
          placeholderColorSeed={from?.name?.firstName}
          size="sm"
          type="rounded"
        />
        {from?.name?.firstName} {from?.name?.lastName}{' '}
        <IconArrowRight size={13} />{' '}
        <Avatar
          avatarUrl={to?.avatarUrl}
          placeholder={to?.name?.firstName}
          placeholderColorSeed={to?.name?.firstName}
          size="sm"
          type="rounded"
        />
        {to?.name?.firstName} {to?.name?.lastName}
      </StyledEventDescriptionText>
    </StyledEventDescription>
  );
}

function TransferToSectorDescription({
  message,
}: {
  message: ClientChatMessage;
}) {
  console.log('message', message);
  const { records: agentWorkspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      name: true,
      avatarUrl: true,
    },
    filter: {
      agentId: {
        eq: message.from,
      },
    },
  });
  const agentWorkspaceMember = agentWorkspaceMembers[0];
  const { record: sector } = useFindOneRecord<Sector & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Sector,
    objectRecordId: message.to,
    recordGqlFields: {
      name: true,
      icon: true,
    },
  });
  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        {t`Service transferred to sector:`}
      </StyledEventDescriptionText>
      <StyledEventDescriptionText>
        <Avatar
          avatarUrl={agentWorkspaceMember?.avatarUrl}
          placeholder={agentWorkspaceMember?.name?.firstName}
          placeholderColorSeed={agentWorkspaceMember?.name?.firstName}
          size="sm"
          type="rounded"
        />
        {agentWorkspaceMember?.name?.firstName}{' '}
        {agentWorkspaceMember?.name?.lastName} <IconArrowRight size={13} />{' '}
        <Avatar
          avatarUrl={sector?.icon}
          placeholder={sector?.name}
          placeholderColorSeed={sector?.name}
          size="sm"
          type="rounded"
        />
        {sector?.name}
      </StyledEventDescriptionText>
    </StyledEventDescription>
  );
}

function ChatbotDescription({ message }: { message: ClientChatMessage }) {
  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        <IconRobot size={13} />{' '}
        {message.event === ClientChatMessageEvent.CHATBOT_START
          ? t`A Chatbot started the service`
          : t`A Chatbot ended the service`}
      </StyledEventDescriptionText>
    </StyledEventDescription>
  );
}

function StartEndDescription({ message }: { message: ClientChatMessage }) {
  const { records: agentWorkspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      name: true,
      avatarUrl: true,
    },
    filter: {
      id: {
        eq: message.from,
      },
    },
  });

  const agentWorkspaceMember = agentWorkspaceMembers[0];

  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        {message.event === ClientChatMessageEvent.START
          ? t`Service started`
          : t`Service finished`}
      </StyledEventDescriptionText>
      <StyledEventDescriptionText>
        <Avatar
          avatarUrl={agentWorkspaceMember?.avatarUrl}
          placeholder={agentWorkspaceMember?.name?.firstName}
          placeholderColorSeed={agentWorkspaceMember?.name?.firstName}
          size="sm"
          type="rounded"
        />
        {agentWorkspaceMember?.name?.firstName}{' '}
        {agentWorkspaceMember?.name?.lastName}
      </StyledEventDescriptionText>
    </StyledEventDescription>
  );
}
