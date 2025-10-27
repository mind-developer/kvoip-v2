import { ChatCard } from '@/chat/client-chat/components/layout/ChatCard';
import { ChatNavigationDrawerHeader } from '@/chat/client-chat/components/layout/ChatNavigationDrawerHeader';
import { ChatNavigationDrawerTabs } from '@/chat/client-chat/components/layout/ChatNavigationDrawerTabs';
import { useClientChats } from '@/chat/client-chat/hooks/useClientChats';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChatMessageType,
  ClientChat,
  ClientChatStatus,
} from 'twenty-shared/types';
import { WorkspaceMember } from '~/generated/graphql';

const StyledPaneSideContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  min-height: max-content;
  min-width: 450px;
  padding: 0 ${({ theme }) => theme.spacing(3)};
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  min-width: 450px;
`;

const StyledChatsContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  height: 80dvh;
  overflow-y: ${({ isScrollable }) => (isScrollable ? 'scroll' : 'unset')};
`;

export const ChatNavigationDrawer = () => {
  const { chatId: openChatId } = useParams();

  const { t } = useLingui();

  const [activeTabId, _] = useRecoilComponentState(
    activeTabIdComponentState,
    'chat-navigation-drawer-tabs',
  );
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();

  const agent = workspaceMemberWithAgent?.agent;
  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & {
      __typename: string;
      agent: {
        id: string;
        sector: { id: string; name: string; icon: string };
      };
    }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      id: true,
      name: true,
      agent: {
        id: true,
        sector: true,
        sectorId: true,
        isAdmin: true,
      },
      agentId: true,
      avatarUrl: true,
    },
  });
  const { records: sectors } = useFindManyRecords<Sector>({
    objectNameSingular: CoreObjectNameSingular.Sector,
    recordGqlFields: {
      id: true,
      name: true,
      icon: true,
    },
  });
  const workspaceMembersWithAgent = workspaceMembers.filter(
    (member) => member.agent.id,
  );
  const { chats: clientChats } = useClientChats(false);

  const [filteredClientChats, setFilteredClientChats] = useState<ClientChat[]>(
    [],
  );
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    setFilteredClientChats(
      clientChats.filter((chat) =>
        (
          (chat.person?.name?.firstName ?? '') +
          ' ' +
          (chat.person?.name?.lastName ?? '')
        )
          .toLowerCase()
          .includes(searchInput.toLowerCase()),
      ),
    );
  }, [searchInput, clientChats]);

  const getChatMessagePreview = (chat: ClientChat) => {
    switch (chat.lastMessageType) {
      case ChatMessageType.TEXT:
        return chat.lastMessagePreview;
      case ChatMessageType.IMAGE:
        return '📷 Image';
      case ChatMessageType.AUDIO:
        return '🎧 Audio';
      case ChatMessageType.DOCUMENT:
        return '📄 Document';
      case ChatMessageType.VIDEO:
        return '🎥 Video';
      default:
        return t`Click to open chat`;
    }
  };
  const tabs: SingleTabProps[] = [
    {
      id: ClientChatStatus.ASSIGNED,
      title: agent?.isAdmin ? 'Assigned' : 'Mine',
      incomingMessages: clientChats.filter(
        (chat) =>
          chat.status === ClientChatStatus.ASSIGNED &&
          chat.agentId === agent?.id &&
          chat.unreadMessagesCount > 0,
      ).length,
    },
    {
      id: ClientChatStatus.UNASSIGNED,
      title: 'Unassigned',
      incomingMessages: clientChats.filter(
        (chat) => chat.status === ClientChatStatus.UNASSIGNED,
      ).length,
    },
    {
      id: ClientChatStatus.ABANDONED,
      title: 'Abandoned',
      incomingMessages: clientChats.filter(
        (chat) => chat.status === ClientChatStatus.ABANDONED,
      ).length,
    },
    {
      id: ClientChatStatus.CHATBOT,
      title: 'With Chatbot',
      incomingMessages: clientChats.filter(
        (chat) => chat.status === ClientChatStatus.CHATBOT,
      ).length,
    },
  ];

  const renderClientChats = () => {
    if (!workspaceMemberWithAgent) {
      return null;
    }

    return filteredClientChats.map((chat, index) => {
      if (chat.status !== activeTabId && activeTabId !== 'all') {
        return null;
      }
      if (chat.status === ClientChatStatus.FINISHED) {
        return null;
      }
      if (
        chat.status === ClientChatStatus.ASSIGNED &&
        chat.agentId !== workspaceMemberWithAgent?.agent?.id &&
        !workspaceMemberWithAgent?.agent?.isAdmin
      ) {
        return null;
      }

      const person = chat.person;
      const clientName =
        (person?.name?.firstName || '') + ' ' + (person?.name?.lastName || '');
      const isAdmin = agent?.isAdmin;
      const chatAgent = workspaceMembersWithAgent.find(
        (member) => member.agent?.id === chat.agent?.id,
      );
      const agentName =
        chatAgent && isAdmin
          ? (chatAgent?.name?.firstName || '') +
            ' ' +
            (chatAgent?.name?.lastName || '')
          : undefined;
      const agentAvatarUrl =
        chatAgent && isAdmin ? (chatAgent?.avatarUrl ?? undefined) : undefined;

      const cardSector = sectors.find((sector) => sector.id === chat.sectorId);

      const sectorName = cardSector?.name;
      const sectorIcon = cardSector?.icon;

      return (
        <ChatCard
          key={index + chat.id}
          name={clientName}
          personAvatarUrl={person?.avatarUrl || ''}
          agentAvatarUrl={isAdmin ? agentAvatarUrl : undefined}
          agentName={isAdmin ? agentName : undefined}
          lastMessagePreview={
            getChatMessagePreview(chat) || t`Click to open chat`
          }
          isSelected={openChatId === chat.id}
          chatId={chat.id}
          unreadMessagesCount={chat.unreadMessagesCount ?? 0}
          sectorName={sectorName}
          sectorIcon={sectorIcon}
        />
      );
    });
  };

  return (
    <StyledPaneSideContainer>
      <ChatNavigationDrawerHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <StyledTabListContainer>
        <ChatNavigationDrawerTabs loading={false} tabs={tabs} />
      </StyledTabListContainer>
      <StyledChatsContainer isScrollable={filteredClientChats.length > 5}>
        {renderClientChats()}
      </StyledChatsContainer>
    </StyledPaneSideContainer>
  );
};
