import { useClientChatSubscription } from '@/chat/client-chat/hooks/useClientChatSubscription';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClientChat, ClientChatStatus } from 'twenty-shared/types';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const useClientChats = (showNotifications: boolean = false) => {
  const { t } = useLingui();
  const { chatId: openChat } = useParams();
  const [dbChats, setDbChats] = useState<ClientChat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueInfoSnackBar } = useSnackBar();

  const [_, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    'chat-navigation-drawer-tabs',
  );
  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const isAdmin = workspaceMemberWithAgent?.agent?.isAdmin;

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
      },
      messengerIntegrationId: true,
      telegramIntegrationId: true,
      provider: true,
    },
    filter: {
      or: [
        { status: { eq: ClientChatStatus.ABANDONED } },
        ...(workspaceMemberWithAgent?.agent?.isAdmin
          ? sectors?.map((sector) => ({ sectorId: { eq: sector.id } })) || []
          : [{ sectorId: { eq: workspaceMemberWithAgent?.agent?.sectorId } }]),
      ],
    },
    limit: 500,
    orderBy: [{ createdAt: 'AscNullsFirst' }],
    onCompleted: (data) => {
      setDbChats(data);
      setLoading(false);
    },
    skip: !sectors || sectors.length === 0,
  });

  useClientChatSubscription({
    sectorId: isAdmin
      ? 'admin'
      : (workspaceMemberWithAgent?.agent?.sectorId ?? ''),
    onChatCreated: (chat) => {
      setDbChats((prev: ClientChat[]) => [
        ...prev.filter((c: ClientChat) => c.id !== chat.id),
        chat,
      ]);
    },
    onError: (error) => {
      console.error('Error onClientChatSubscription', error);
    },
    onChatUpdated: (chat) => {
      if (showNotifications) {
        if (chat.id === openChat) {
          setActiveTabId(chat.status);
        }
      }
      setDbChats((prev: ClientChat[]) =>
        prev.map((c: ClientChat) => (c.id === chat.id ? chat : c)),
      );
    },
    onChatDeleted: (chat) => {
      setDbChats((prev: ClientChat[]) =>
        prev.filter((c: ClientChat) => c.id !== chat.id),
      );
      if (chat.status === ClientChatStatus.FINISHED && showNotifications) {
        enqueueInfoSnackBar({
          message: t`Service finished`,
        });
      }
      if (openChat === chat.id) {
        navigate(getAppPath(AppPath.ClientChatCenter));
        enqueueInfoSnackBar({
          message: t`You no longer have access to this chat`,
        });
        setActiveTabId(ClientChatStatus.UNASSIGNED);
      }
    },
  });

  return {
    chats: dbChats,
    sectors,
    loading,
  };
};
