import { useState } from 'react';

import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
// eslint-disable-next-line no-restricted-imports
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TransferChatOption } from '@/chat/call-center/components/TransferChatOption';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChat,
  ClientChatMessageEvent,
} from 'twenty-shared/types';
import { IconChevronLeft, IconIdBadge2, IconUsers } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { WorkspaceMember } from '~/generated/graphql';
import { useSendClientChatMessage } from '../hooks/useSendClientChatMessage';

type TransferChatOptionsMenu = 'agents' | 'sectors';

export const TransferChatOptionsDropdownContent = () => {
  const { toggleDropdown } = useToggleDropdown();
  const { chatId } = useParams();
  const { sendClientChatMessage } = useSendClientChatMessage();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.ClientChat,
  });
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { record: currentAgent } = useFindOneRecord<
    WorkspaceMember & { __typename: string; agent: { id: string } }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id || '',
    recordGqlFields: {
      agent: {
        id: true,
      },
    },
  });

  const selectedChat = useFindOneRecord<ClientChat & { __typename: string }>({
    objectNameSingular: 'clientChat',
    recordGqlFields: {
      id: true,
      agentId: true,
      sectorId: true,
      status: true,
      whatsappIntegrationId: true,
      messengerIntegrationId: true,
      telegramIntegrationId: true,
    },
    objectRecordId: chatId || '',
  }).record;

  const { records: workspaceMembers } = useFindManyRecords<
    WorkspaceMember & { __typename: string; agentId: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      id: true,
      name: true,
      avatarUrl: true,
      agent: true,
      agentId: true,
    },
  });
  console.log(workspaceMembers);
  const workspaceMembersWithAgent = workspaceMembers.filter(
    (member) => member.agentId && member.agentId !== currentAgent?.agent?.id,
  );

  const [currentMenu, setCurrentMenu] = useState<
    TransferChatOptionsMenu | undefined
  >(undefined);

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: TransferChatOptionsMenu) => {
    setCurrentMenu(option);
  };

  return (
    <>
      {!currentMenu && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={() => handleSelectMenu('sectors')}
            LeftIcon={IconIdBadge2}
            text="Sectors"
            hasSubMenu
          />
          <MenuItem
            onClick={() => handleSelectMenu('agents')}
            LeftIcon={IconUsers}
            text="Agents"
            hasSubMenu
          />
        </DropdownMenuItemsContainer>
      )}
      {currentMenu === 'agents' && (
        <>
          <DropdownMenuHeader
            StartComponent={<IconChevronLeft />}
            onClick={resetMenu}
          >
            Agents
          </DropdownMenuHeader>
          {workspaceMembersWithAgent.map((member: any) => (
            <TransferChatOption
              key={member.agentId}
              hasAvatar={true}
              agent={member}
              onClick={() => {
                if (!selectedChat?.id || !currentAgent?.agent?.id) return;
                sendClientChatMessage({
                  clientChatId: selectedChat.id,
                  from: currentAgent.agent.id,
                  fromType: ChatMessageFromType.AGENT,
                  to: member.agentId,
                  toType: ChatMessageToType.AGENT,
                  provider: ChatIntegrationProvider.WHATSAPP,
                  type: ChatMessageType.EVENT,
                  textBody: null,
                  caption: null,
                  deliveryStatus: ChatMessageDeliveryStatus.SENT,
                  edited: null,
                  attachmentUrl: null,
                  event: ClientChatMessageEvent.TRANSFER_TO_AGENT,
                  workspaceId: currentWorkspace?.id ?? '',
                  providerIntegrationId:
                    selectedChat?.whatsappIntegrationId ??
                    selectedChat?.messengerIntegrationId ??
                    selectedChat?.telegramIntegrationId ??
                    '',
                });
                toggleDropdown();
              }}
            />
          ))}
        </>
      )}
      {currentMenu === 'sectors' && (
        <>
          <DropdownMenuHeader
            StartComponent={<IconChevronLeft />}
            onClick={resetMenu}
          >
            Sectors
          </DropdownMenuHeader>
          {sectors.map((sector) => (
            <TransferChatOption
              key={sector.id}
              text={sector.name}
              LeftIcon={sector.icon}
              onClick={() => {
                console.log(sector);
                if (!currentAgent?.agent?.id || !selectedChat?.id) return;
                sendClientChatMessage({
                  clientChatId: selectedChat.id,
                  from: currentAgent.agent.id,
                  fromType: ChatMessageFromType.AGENT,
                  to: sector.id,
                  toType: ChatMessageToType.SECTOR,
                  provider: ChatIntegrationProvider.WHATSAPP,
                  type: ChatMessageType.EVENT,
                  textBody: null,
                  caption: null,
                  deliveryStatus: ChatMessageDeliveryStatus.SENT,
                  edited: null,
                  attachmentUrl: null,
                  event: ClientChatMessageEvent.TRANSFER_TO_SECTOR,
                  workspaceId: currentWorkspace?.id ?? '',
                  providerIntegrationId:
                    selectedChat?.whatsappIntegrationId ??
                    selectedChat?.messengerIntegrationId ??
                    selectedChat?.telegramIntegrationId ??
                    '',
                });
              }}
            />
          ))}
        </>
      )}
    </>
  );
};
