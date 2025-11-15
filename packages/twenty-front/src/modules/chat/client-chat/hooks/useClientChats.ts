import { useClientChatSubscription } from '@/chat/client-chat/hooks/useClientChatSubscription';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppPath, type ClientChat, ClientChatStatus } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const useClientChats = (showNotifications: boolean = false) => {
  const { t } = useLingui();
  const { chatId: openChat } = useParams();
  const [dbChats, setDbChats] = useState<ClientChat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const isAdmin = workspaceMemberWithAgent?.agent?.isAdmin;

  // Memoize the filter to avoid unnecessary re-renders
  const chatFilter = useMemo(
    () => ({
      or: [
        { status: { eq: ClientChatStatus.ABANDONED } },
        ...(isAdmin
          ? sectors?.map((sector) => ({ sectorId: { eq: sector.id } })) || []
          : [
              {
                sectorId: { eq: workspaceMemberWithAgent?.agent?.sectorId },
              },
            ]),
      ],
    }),
    [isAdmin, sectors, workspaceMemberWithAgent?.agent?.sectorId],
  );

  // Helper function to check if a chat matches the current filter
  const chatMatchesFilter = useCallback(
    (chat: ClientChat): boolean => {
      // Always include abandoned chats
      if (chat.status === ClientChatStatus.ABANDONED) {
        return true;
      }
      // Check if chat belongs to admin's sectors or user's sector
      if (isAdmin) {
        return sectors?.some((sector) => sector.id === chat.sectorId) ?? false;
      }
      return chat.sectorId === workspaceMemberWithAgent?.agent?.sectorId;
    },
    [isAdmin, sectors, workspaceMemberWithAgent?.agent?.sectorId],
  );

  useFindManyRecords<ClientChat & { __typename: string; id: string }>({
    objectNameSingular: 'clientChat',
    recordGqlFields: {
      id: true,
      providerContactId: true,
      status: true,
      updatedAt: true,
      lastMessagePreview: true,
      lastMessageType: true,
      lastMessageDate: true,
      agent: {
        id: true,
      },
      sector: {
        name: true,
        id: true,
        icon: true,
      },
      sectorId: true,
      agentId: true,
      person: {
        id: true,
        avatarUrl: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
      unreadMessagesCount: true,
      whatsappIntegrationId: true,
      whatsappIntegration: {
        id: true,
        apiType: true,
        name: true,
      },
      messengerIntegrationId: true,
      telegramIntegrationId: true,
      provider: true,
    },
    filter: chatFilter,
    limit: 500,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbChats(data);
      setLoading(false);
    },
    skip: !sectors || sectors.length === 0,
  });

  const [activeTabId, setActiveTabIdState] = useRecoilComponentState(
    activeTabIdComponentState,
    'chat-navigation-drawer-tabs',
  );

  const handleChatCreated = useCallback(
    (chat: ClientChat) => {
      // Only add if it matches the filter
      if (chatMatchesFilter(chat)) {
        setDbChats((prev: ClientChat[]) => {
          // Check if chat already exists to avoid duplicates
          if (prev.some((c) => c.id === chat.id)) {
            return prev;
          }
          return [...prev, chat];
        });
      }
    },
    [chatMatchesFilter],
  );

  const handleChatUpdated = useCallback(
    (chat: ClientChat) => {
      if (chat.id === openChat && activeTabId !== chat.status) {
        setActiveTabIdState(chat.status);
      }

      setDbChats((prev: ClientChat[]) => {
        const existingChatIndex = prev.findIndex((c) => c.id === chat.id);

        // If chat doesn't exist in the list
        if (existingChatIndex === -1) {
          // Only add if it matches the filter
          if (chatMatchesFilter(chat)) {
            return [...prev, chat];
          }
          return prev;
        }

        // Chat exists, merge the update
        const existingChat = prev[existingChatIndex];
        const mergedChat = {
          ...existingChat,
          ...chat,
          // Preserve nested objects if they're not in the update
          agent: chat.agent ?? existingChat.agent,
          sector: chat.sector ?? existingChat.sector,
          person: chat.person ?? existingChat.person,
          whatsappIntegration:
            chat.whatsappIntegration ?? existingChat.whatsappIntegration,
        };

        // Check if chat still matches the filter after update
        if (chatMatchesFilter(mergedChat)) {
          // Update the chat in place
          const updated = [...prev];
          updated[existingChatIndex] = mergedChat;
          return updated;
        } else {
          // Remove chat if it no longer matches the filter
          return prev.filter((c) => c.id !== chat.id);
        }
      });
    },
    [openChat, activeTabId, setActiveTabIdState, chatMatchesFilter],
  );

  const handleChatDeleted = useCallback(
    (chat: ClientChat) => {
      setDbChats((prev: ClientChat[]) =>
        prev.filter((c: ClientChat) => c.id !== chat.id),
      );
      if (chat.status === ClientChatStatus.FINISHED && showNotifications) {
        enqueueInfoSnackBar({
          message: t`Service finished`,
        });
        return;
      }
      if (openChat === chat.id) {
        navigate(getAppPath(AppPath.ClientChatCenter));
        enqueueInfoSnackBar({
          message: t`You no longer have access to this chat`,
        });
        setActiveTabIdState(ClientChatStatus.UNASSIGNED);
      }
    },
    [
      openChat,
      showNotifications,
      navigate,
      enqueueInfoSnackBar,
      t,
      setActiveTabIdState,
    ],
  );

  useClientChatSubscription({
    sectorId: isAdmin
      ? 'admin'
      : (workspaceMemberWithAgent?.agent?.sectorId ?? ''),
    onChatCreated: handleChatCreated,
    onError: (error) => {
      console.error('Error onClientChatSubscription', error);
    },
    onChatUpdated: handleChatUpdated,
    onChatDeleted: handleChatDeleted,
  });

  return {
    chats: dbChats,
    sectors,
    loading,
  };
};
