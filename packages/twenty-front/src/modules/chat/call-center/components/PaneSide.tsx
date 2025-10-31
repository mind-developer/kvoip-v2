import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { PaneSideHeader } from '@/chat/call-center/components/PaneSideHeader';
import { PaneSideTabs } from '@/chat/call-center/components/PaneSideTabs';
import { ResolvedChats } from '@/chat/call-center/components/ResolvedChats';
import { useClientChatsWithPerson } from '@/chat/call-center/hooks/useClientChatsWithPerson';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClientChatStatus } from 'twenty-shared/types';

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
  width: 100%;
`;

const StyledChatsContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  height: 80dvh;
  overflow-y: ${({ isScrollable }) => (isScrollable ? 'scroll' : 'unset')};
`;

const TAB_LIST_COMPONENT_ID = 'chat-call-center-tabs';

export const PaneSide = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    params.chatId || null,
  );

  // Handle chat selection with navigation
  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/call-center/${chatId}`);
  };

  // Buscar chats em tempo real do ClientChatWorkspaceEntity com dados da pessoa
  const { chats: clientChats, loading: loadingChats } =
    useClientChatsWithPerson();

  const tabs: SingleTabProps[] = [
    {
      id: 'mine',
      title: 'Mine',
      // incomingMessages: unreadTabMessages?.unreadMine,
    },
    {
      id: 'unassigned',
      title: 'Unassigned',
      // incomingMessages: unreadTabMessages?.unreadUnassigned,
    },
    {
      id: 'abandoned',
      title: 'Abandoned',
      // incomingMessages: unreadTabMessages?.unreadAbandoned,
    },
  ];

  // Filtrar chats ativos (não resolvidos)
  const activeClientChats = clientChats.filter(
    (chat) => chat.status !== ClientChatStatus.RESOLVED,
  );

  const isScrollable = activeClientChats.length > 5;

  const renderClientChats = () =>
    activeClientChats.map((chat) => {
      const person = chat.person;
      const clientName = person
        ? `${person.firstName || ''} ${person.lastName || ''}`.trim() ||
          'Cliente'
        : `Cliente ${chat.providerContactId}`;

      return (
        <ChatCell
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onSelect={() => handleChatSelect(chat.id)}
        />
      );
    });

  // const renderMessengerChats = () => {
  //   return messengerChats.map((chat: any) => {
  //     if (chat.status === statusEnum.Resolved) return <></>;

  //     return (
  //       <ChatCell
  //         key={chat.client.id}
  //         platform="messenger"
  //         chat={chat}
  //         isSelected={
  //           selectedChatId === `${chat.integrationId}_${chat.client.id}`
  //         }
  //         onSelect={() =>
  //           setSelectedChatId(`${chat.integrationId}_${chat.client.id}`)
  //         }
  //       />
  //     );
  //   });
  // };

  return (
    <StyledPaneSideContainer>
      <PaneSideHeader />
      <div>
        <StyledTabListContainer>
          <PaneSideTabs
            loading={false}
            tabListId={TAB_LIST_COMPONENT_ID}
            tabs={tabs}
          />
        </StyledTabListContainer>
        <StyledChatsContainer isScrollable={isScrollable}>
          {loadingChats ? (
            <div>Carregando chats...</div>
          ) : (
            <>
              {renderClientChats()}
              <ResolvedChats />
            </>
          )}
        </StyledChatsContainer>
      </div>
    </StyledPaneSideContainer>
  );
};
