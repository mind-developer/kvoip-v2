/* @kvoip-woulz proprietary */
import { ChatCard } from '@/chat/client-chat/components/layout/ChatCard';
import { ChatNavigationDrawerHeader } from '@/chat/client-chat/components/layout/ChatNavigationDrawerHeader';
import { ChatNavigationDrawerTabs } from '@/chat/client-chat/components/layout/ChatNavigationDrawerTabs';
import { useClientChatsContext } from '@/chat/client-chat/contexts/ClientChatsContext';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChatMessageType,
  type ClientChat,
  ClientChatStatus,
} from 'twenty-shared/types';
import { type WorkspaceMember } from '~/generated/graphql';

const DRAWER_MIN_WIDTH = 250;
const DRAWER_DEFAULT_WIDTH = 450;
const DRAWER_WIDTH_STORAGE_KEY = 'chat-navigation-drawer-width';
export const CHAT_MIN_WIDTH = 450;

const StyledChatNavigationDrawerWrapper = styled.div<{ width: number }>`
  display: flex;
  flex-direction: row;
  position: relative;
  width: ${({ width }) => width}px;
  flex-shrink: 0;
`;

const StyledChatNavigationDrawerContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  min-height: max-content;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  overflow-y: scroll;
`;

const StyledResizeHandle = styled.div`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  position: absolute;
  right: -4px;
  top: 0;
  width: 2px;
  z-index: 1;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    &::after {
      content: '';
      display: block;
      background-color: ${({ theme }) => theme.background.invertedPrimary};
      position: absolute;
      right: calc(50% - 3px);
      top: calc(50% - 18px);
      width: 6px;
      height: 36px;
      border-radius: ${({ theme }) => theme.border.radius.xl};
    }
  }

  &:active {
    background-color: ${({ theme }) => theme.border.color.strong};
    &::after {
      content: '';
      display: block;
      background-color: ${({ theme }) => theme.background.invertedPrimary};
      position: absolute;
      right: calc(50% - 3px);
      top: calc(50% - 18px);
      width: 6px;
      height: 36px;
      border-radius: ${({ theme }) => theme.border.radius.xl};
    }
  }
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

  const [drawerWidth, setDrawerWidth] = useState(() => {
    const stored = localStorage.getItem(DRAWER_WIDTH_STORAGE_KEY);
    return stored
      ? Math.max(parseInt(stored, 10), DRAWER_MIN_WIDTH)
      : DRAWER_DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [initialPointerX, setInitialPointerX] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (wrapperRef.current?.parentElement) {
        setContainerWidth(wrapperRef.current.parentElement.clientWidth);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    let isCleanedUp = false;

    const setupObserver = () => {
      if (isCleanedUp) return;

      updateContainerWidth();

      // Set up ResizeObserver after ensuring ref is available
      resizeObserver = new ResizeObserver(() => {
        if (!isCleanedUp) {
          updateContainerWidth();
        }
      });

      if (wrapperRef.current?.parentElement && !isCleanedUp) {
        resizeObserver.observe(wrapperRef.current.parentElement);
      }

      window.addEventListener('resize', updateContainerWidth);
    };

    // Initial update after ref is set
    const timeoutId = setTimeout(setupObserver, 0);

    return () => {
      isCleanedUp = true;
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateContainerWidth);
      resizeObserver?.disconnect();
    };
  }, []);

  const maxDrawerWidth = useMemo(() => {
    if (containerWidth === null) return null;
    return Math.max(DRAWER_MIN_WIDTH, containerWidth - CHAT_MIN_WIDTH);
  }, [containerWidth]);

  useEffect(() => {
    if (maxDrawerWidth !== null && drawerWidth > maxDrawerWidth) {
      setDrawerWidth(maxDrawerWidth);
    }
  }, [maxDrawerWidth, drawerWidth]);

  useEffect(() => {
    localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, drawerWidth.toString());
  }, [drawerWidth]);

  const handleResizeStart = useCallback<PointerEventListener>(
    ({ x }) => {
      setIsResizing(true);
      setInitialPointerX(x);
      setInitialWidth(drawerWidth);
    },
    [drawerWidth],
  );

  const handleResizeMove = useCallback<PointerEventListener>(
    ({ x }) => {
      if (!isResizing || initialPointerX === null || initialWidth === null)
        return;
      const deltaX = x - initialPointerX;
      let newWidth = initialWidth + deltaX;

      // Enforce minimum width
      newWidth = Math.max(DRAWER_MIN_WIDTH, newWidth);

      // Enforce maximum width (leave at least CHAT_MIN_WIDTH for chat component)
      if (maxDrawerWidth !== null) {
        newWidth = Math.min(newWidth, maxDrawerWidth);
      }

      setDrawerWidth(newWidth);
    },
    [isResizing, initialPointerX, initialWidth, maxDrawerWidth],
  );

  const handleResizeEnd = useCallback<PointerEventListener>(() => {
    setIsResizing(false);
    setInitialPointerX(null);
    setInitialWidth(null);
  }, []);

  const handleDoubleClick = useCallback(() => {
    let resetWidth = DRAWER_DEFAULT_WIDTH;

    // Enforce minimum width
    resetWidth = Math.max(DRAWER_MIN_WIDTH, resetWidth);

    // Enforce maximum width (leave at least CHAT_MIN_WIDTH for chat component)
    if (maxDrawerWidth !== null) {
      resetWidth = Math.min(resetWidth, maxDrawerWidth);
    }

    setDrawerWidth(resetWidth);
  }, [maxDrawerWidth]);

  useTrackPointer({
    shouldTrackPointer: isResizing,
    onMouseMove: handleResizeMove,
    onMouseUp: handleResizeEnd,
  });

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
    (member) => member.agent?.id,
  );
  const { chats: clientChats } = useClientChatsContext();

  const [searchInput, setSearchInput] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const onSortClick = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const filteredClientChats = useMemo(() => {
    const filteredChats = clientChats.filter(
      (chat) =>
        (chat.person?.name?.firstName ?? '') +
        ' ' +
        (chat.person?.name?.lastName ?? '')
          .toLowerCase()
          .includes(searchInput.toLowerCase()),
    );
    return sortDirection === 'asc' ? filteredChats : filteredChats.reverse();
  }, [searchInput, clientChats, sortDirection]);

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
      case ChatMessageType.STICKER:
        return '🌠 Sticker';
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

  const renderClientChats = useMemo(() => {
    if (!workspaceMemberWithAgent) {
      return null;
    }

    return filteredClientChats.map((chat, index) => {
      const currentUserIsAdmin = agent?.isAdmin;
      if (chat.status !== activeTabId) {
        return null;
      }
      if (chat.status === ClientChatStatus.FINISHED && !currentUserIsAdmin) {
        return null;
      }
      if (
        chat.status === ClientChatStatus.ASSIGNED &&
        chat.agentId !== workspaceMemberWithAgent?.agent?.id &&
        !currentUserIsAdmin
      ) {
        return null;
      }

      const person = chat.person;
      const personName =
        (person?.name?.firstName || '') + ' ' + (person?.name?.lastName || '');

      const chatAgent = workspaceMembersWithAgent.find(
        (member) => member.agent?.id === chat.agent?.id,
      );
      const agentName =
        chatAgent && currentUserIsAdmin
          ? (chatAgent?.name?.firstName || '') +
            ' ' +
            (chatAgent?.name?.lastName || '')
          : undefined;
      const agentAvatarUrl =
        chatAgent && currentUserIsAdmin
          ? (chatAgent?.avatarUrl ?? undefined)
          : undefined;

      const cardSector = sectors.find(
        (sector) => sector.id === chat.sector?.id,
      );

      const sectorName = cardSector?.name;
      const sectorIcon = cardSector?.icon;

      return (
        <ChatCard
          key={index + chat.id}
          name={personName}
          personAvatarUrl={person?.avatarUrl || ''}
          agentAvatarUrl={currentUserIsAdmin ? agentAvatarUrl : undefined}
          agentName={currentUserIsAdmin ? agentName : undefined}
          lastMessagePreview={
            getChatMessagePreview(chat) || t`Click to open chat`
          }
          isSelected={openChatId === chat.id}
          chatId={chat.id}
          unreadMessagesCount={chat.unreadMessagesCount ?? 0}
          sectorName={currentUserIsAdmin ? sectorName : undefined}
          sectorIcon={currentUserIsAdmin ? sectorIcon : undefined}
        />
      );
    });
  }, [filteredClientChats, openChatId, agent?.isAdmin, activeTabId]);

  return (
    <StyledChatNavigationDrawerWrapper ref={wrapperRef} width={drawerWidth}>
      <StyledChatNavigationDrawerContainer>
        <ChatNavigationDrawerHeader
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSortClick={onSortClick}
          sortDirection={sortDirection}
        />
        <StyledTabListContainer>
          <ChatNavigationDrawerTabs loading={false} tabs={tabs} />
        </StyledTabListContainer>
        <StyledChatsContainer isScrollable={filteredClientChats.length > 5}>
          {renderClientChats}
        </StyledChatsContainer>
      </StyledChatNavigationDrawerContainer>
      <StyledResizeHandle
        onMouseDown={(e) => {
          e.preventDefault();
          handleResizeStart({
            x: e.clientX,
            y: e.clientY,
            event: e.nativeEvent,
          });
        }}
        onDoubleClick={handleDoubleClick}
      />
    </StyledChatNavigationDrawerWrapper>
  );
};
