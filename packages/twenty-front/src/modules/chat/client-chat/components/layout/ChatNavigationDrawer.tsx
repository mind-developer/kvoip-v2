import { ChatCard } from '@/chat/client-chat/components/layout/ChatCard';
import { ChatNavigationDrawerHeader } from '@/chat/client-chat/components/layout/ChatNavigationDrawerHeader';
import { ChatNavigationDrawerTabs } from '@/chat/client-chat/components/layout/ChatNavigationDrawerTabs';
import { useClientChats } from '@/chat/client-chat/hooks/useClientChats';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
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

  const { chats: clientChats } = useClientChats(agent?.sectorId || '', false);

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
  if (
    !workspaceMemberWithAgent ||
    !workspaceMemberWithAgent?.agent ||
    !workspaceMemberWithAgent.agent.sectorId
  )
    return null;

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
      title: 'Mine',
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

  const renderClientChats = () =>
    filteredClientChats.map((chat, index) => {
      if (chat.status !== activeTabId) return null;
      if (chat.status === ClientChatStatus.FINISHED) return null;
      if (
        chat.status === ClientChatStatus.ASSIGNED &&
        chat.agentId !== agent?.id
      )
        return null;
      const person = chat.person;
      const clientName = person?.name?.firstName + ' ' + person?.name?.lastName;

      return (
        <ChatCard
          key={index + chat.id}
          name={clientName}
          avatarUrl={person?.avatarUrl || ''}
          lastMessagePreview={
            getChatMessagePreview(chat) || t`Click to open chat`
          }
          isSelected={openChatId === chat.id}
          chatId={chat.id}
          unreadMessagesCount={chat.unreadMessagesCount ?? 0}
        />
      );
    });

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
        <>{renderClientChats()}</>
      </StyledChatsContainer>
    </StyledPaneSideContainer>
  );
};
