import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { PaneSideHeader } from '@/chat/call-center/components/PaneSideHeader';
import { PaneSideTabs } from '@/chat/call-center/components/PaneSideTabs';
import { useClientChats } from '@/chat/call-center/hooks/useClientChats';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/call-center/hooks/useCurrentWorkspaceMemberWithAgent';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router-dom';
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
  min-width: 350px;
`;

const StyledChatsContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  height: 80dvh;
  overflow-y: ${({ isScrollable }) => (isScrollable ? 'scroll' : 'unset')};
`;

export const PaneSide = () => {
  const navigate = useNavigate();
  const { chatId: openChatId } = useParams();

  const { t } = useLingui();

  const [activeTabId, _] = useRecoilComponentState(
    activeTabIdComponentState,
    'pane-side-tabs',
  );
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();

  const agent = workspaceMemberWithAgent?.agent;

  const { chats: clientChats } = useClientChats(agent?.sectorId || '');

  // Handle chat selection with navigation
  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/call-center/${chatId}`);
  };

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

  // Filtrar chats ativos (não resolvidos)
  const activeClientChats = clientChats.filter(
    (chat) => chat.status !== ClientChatStatus.FINISHED,
  );

  const isScrollable = activeClientChats.length > 5;

  const renderClientChats = () =>
    activeClientChats.map((chat, index) => {
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
        <ChatCell
          key={index + chat.id}
          name={clientName}
          avatarUrl={person?.avatarUrl || ''}
          lastMessagePreview={
            getChatMessagePreview(chat) || t`Click to open chat`
          }
          isSelected={openChatId === chat.id}
          onSelect={() => handleChatSelect(chat.id)}
          unreadMessagesCount={chat.unreadMessagesCount ?? 0}
        />
      );
    });

  return (
    <StyledPaneSideContainer>
      <PaneSideHeader />
      <StyledTabListContainer>
        <PaneSideTabs loading={false} tabs={tabs} />
      </StyledTabListContainer>
      <StyledChatsContainer isScrollable={isScrollable}>
        <>
          {renderClientChats()}
          {/* <ResolvedChats /> */}
        </>
      </StyledChatsContainer>
    </StyledPaneSideContainer>
  );
};
