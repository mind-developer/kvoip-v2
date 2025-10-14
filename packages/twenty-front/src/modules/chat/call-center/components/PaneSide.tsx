import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { PaneSideHeader } from '@/chat/call-center/components/PaneSideHeader';
import { PaneSideTabs } from '@/chat/call-center/components/PaneSideTabs';
import { ResolvedChats } from '@/chat/call-center/components/ResolvedChats';
import { useClientChatSubscription } from '@/chat/call-center/hooks/useClientChatSubscription';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ClientChat, ClientChatStatus } from 'twenty-shared/types';
import { WorkspaceMember } from '~/generated/graphql';

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

export const PaneSide = () => {
  const navigate = useNavigate();
  const { chatId: openChatId } = useParams();

  const { t } = useLingui();

  const currentMemberId = useRecoilValue(currentWorkspaceMemberState)!.id;
  const [clientChats, setClientChats] = useState<ClientChat[]>([]);
  const [sectorId, setSectorId] = useState<string | null>('');

  const { record: currentMember } = useFindOneRecord<
    WorkspaceMember & { __typename: string; agentId: string }
  >({
    objectNameSingular: 'workspaceMember',
    objectRecordId: currentMemberId,
  });

  // Fetch agent data when currentMember is available
  useFindOneRecord<{
    __typename: string;
    id: string;
    sectorId: string;
  }>({
    objectNameSingular: 'agent',
    objectRecordId: currentMember?.agentId || '',
    skip: !currentMember?.agentId,
    onCompleted: (data) => {
      if (data?.sectorId) {
        setSectorId(data.sectorId);
      }
    },
  });

  // Fetch client chats when sectorId is available
  useFindManyRecords<ClientChat & { __typename: string }>({
    objectNameSingular: 'clientChat',
    recordGqlFields: {
      id: true,
      providerContactId: true,
      status: true,
      updatedAt: true,
      lastMessagePreview: true,
      lastMessageType: true,
      lastMessageDate: true,
      person: {
        id: true,
        avatarUrl: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
    },
    filter: { sectorId: { eq: sectorId || '' } },
    skip: !sectorId,
    onCompleted: (data) => {
      setClientChats(data);
    },
  });

  // Handle chat selection with navigation
  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/call-center/${chatId}`);
  };

  useClientChatSubscription({
    sectorId: sectorId || '',
    onChatCreated: (chat) => {
      setClientChats((prev) => [...prev, chat]);
    },
    onChatUpdated: (chat) => {
      setClientChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
    },
    onError: (error) => {
      console.error('Error onClientChatSubscription:', error);
    },
    skip: !sectorId,
  });

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
      const clientName = person?.name?.firstName + ' ' + person?.name?.lastName;

      return (
        <ChatCell
          key={chat.id}
          name={clientName}
          avatarUrl={person?.avatarUrl || ''}
          lastMessagePreview={
            chat.lastMessagePreview ?? t`Clique para abrir o chat`
          }
          isSelected={openChatId === chat.id}
          onSelect={() => handleChatSelect(chat.id)}
        />
      );
    });

  if (!sectorId || !currentMember) return null;

  return (
    <StyledPaneSideContainer>
      <PaneSideHeader />
      <StyledTabListContainer>
        <PaneSideTabs loading={false} tabs={tabs} />
      </StyledTabListContainer>
      <StyledChatsContainer isScrollable={isScrollable}>
        <>
          {renderClientChats()}
          <ResolvedChats />
        </>
      </StyledChatsContainer>
    </StyledPaneSideContainer>
  );
};
