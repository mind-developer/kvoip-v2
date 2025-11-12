import { CachedAvatarComponent } from '@/chat/client-chat/components/message/CachedAvatarComponent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowRight, IconRobot, IconZzz } from '@tabler/icons-react';
import {
  ChatMessageFromType,
  type ClientChatMessage,
  ClientChatMessageEvent,
} from 'twenty-shared/types';
import { Avatar, useIcons } from 'twenty-ui/display';
import { type WorkspaceMember } from '~/generated/graphql';

export default function EventMessage({
  message,
}: {
  message: ClientChatMessage;
}) {
  switch (message.event) {
    case ClientChatMessageEvent.START:
      return (
        <EventWrapper message={message}>
          <StartEndDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.END:
      return (
        <EventWrapper message={message}>
          <StartEndDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.TRANSFER_TO_AGENT:
      return (
        <EventWrapper message={message}>
          <TransferToAgentDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.TRANSFER_TO_SECTOR:
      return (
        <EventWrapper message={message}>
          <TransferToSectorDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.ONHOLD:
      return (
        <EventWrapper message={message}>
          <p>{t`Service placed on hold`}</p>
        </EventWrapper>
      );
    case ClientChatMessageEvent.CHATBOT_START:
      return (
        <EventWrapper message={message}>
          <ChatbotDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.CHATBOT_END:
      return (
        <EventWrapper message={message}>
          <ChatbotDescription message={message} />
        </EventWrapper>
      );
    case ClientChatMessageEvent.ABANDONED:
      return (
        <EventWrapper message={message}>
          <AbandonedDescription />
        </EventWrapper>
      );
  }
}

const StyledEventWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const EventWrapper = ({
  children,
  message,
}: {
  children: React.ReactNode;
  message: ClientChatMessage;
}) => {
  return (
    <StyledEventWrapper>
      <StyledEventDescriptionText variant="bold">
        {message.createdAt ?? ''}
      </StyledEventDescriptionText>
      {children}
    </StyledEventWrapper>
  );
};

const StyledEventDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  margin: 0;
`;

const StyledEventDescriptionText = styled.div<{ variant?: 'bold' }>`
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
  const { getIcon } = useIcons();
  const Icon = getIcon(sector?.icon);
  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        {t`Service transferred to sector:`}
      </StyledEventDescriptionText>
      <StyledEventDescriptionText>
        <CachedAvatarComponent
          senderId={agentWorkspaceMember?.id}
          senderType={ChatMessageFromType.CHATBOT}
          animateDelay={0}
          showName={true}
        />
        {agentWorkspaceMember?.name?.firstName}{' '}
        {agentWorkspaceMember?.name?.lastName} <IconArrowRight size={13} />{' '}
        {<Icon size={13} />}
        {sector?.name}
      </StyledEventDescriptionText>
    </StyledEventDescription>
  );
}

function AbandonedDescription() {
  return (
    <StyledEventDescription>
      <StyledEventDescriptionText variant="bold">
        <IconZzz size={13} />{' '}
        {t`Service moved to abandoned due to inactivity from agent`}
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
      agentId: {
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
