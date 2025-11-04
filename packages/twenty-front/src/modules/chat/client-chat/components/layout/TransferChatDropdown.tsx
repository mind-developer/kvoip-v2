import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useClientChatsContext } from '@/chat/client-chat/contexts/ClientChatsContext';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useLingui } from '@lingui/react/macro';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import {
  Avatar,
  IconCheck,
  IconChevronLeft,
  IconIdBadge2,
  IconUsers,
  useIcons,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  MenuItem,
  type MenuItemAccent,
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
} from 'twenty-ui/navigation';
import { type WorkspaceMember } from '~/generated/graphql';
import { useSendClientChatMessage } from '../../hooks/useSendClientChatMessage';

type TransferChatOptionsMenu = 'agents' | 'sectors';

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: 5px;
  width: 24px;
  min-width: 24px;
`;

const StyledMenuItem = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 5.5px ${({ theme }) => theme.spacing(2)};
`;

const StyledIconCheck = styled(IconCheck)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledDiv = styled.div`
  display: flex;
`;

type TransferChatOptionProps = {
  accent?: MenuItemAccent;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  LeftIcon?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text?: React.ReactNode;
  isSelected?: boolean;
  hasAvatar?: boolean;
  agent?: WorkspaceMember;
};

const TransferChatOption = ({
  accent = 'default',
  className,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  isSelected,
  agent,
  hasAvatar,
}: TransferChatOptionProps) => {
  const { getIcon } = useIcons();
  const icon = getIcon(LeftIcon);

  const handleMenuItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StyledMenuItem>
        {hasAvatar ? (
          <StyledDiv>
            <Avatar
              placeholder={agent?.name.firstName}
              avatarUrl={agent?.avatarUrl}
              size="md"
              type="rounded"
            />
            {`${agent?.name.firstName} ${agent?.name.lastName}`}
          </StyledDiv>
        ) : (
          <MenuItemLeftContent LeftIcon={icon ?? undefined} text={text} />
        )}
      </StyledMenuItem>
      {isSelected && <StyledIconCheck size={16} />}
    </StyledHoverableMenuItemBase>
  );
};

const TransferChatDropdownContent = () => {
  const { t } = useLingui();
  const { toggleDropdown } = useToggleDropdown();
  const { sendClientChatMessage, loading } = useSendClientChatMessage();
  const { chatId } = useParams();
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const { chats, sectors } = useClientChatsContext();
  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === chatId),
    [chats, chatId],
  );

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

  const workspaceMembersWithAgent = workspaceMembers.filter(
    (member) => member.agentId && member.agentId !== selectedChat?.agentId,
  );

  const [currentMenu, setCurrentMenu] = useState<
    TransferChatOptionsMenu | undefined
  >(undefined);

  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: TransferChatOptionsMenu) => {
    setCurrentMenu(option);
  };

  const filteredWorkspaceMembersWithAgent = workspaceMembersWithAgent.filter(
    (member: any) =>
      member.agentId !== selectedChat?.agentId &&
      member.agentId !== workspaceMemberWithAgent?.agent.id,
  );

  const filteredSectors = sectors.filter(
    (sector) =>
      sector.id !== selectedChat?.sectorId ||
      selectedChat.status === ClientChatStatus.ASSIGNED ||
      selectedChat.status === ClientChatStatus.CHATBOT,
  );

  const handleTransferToAgent = (member: any) => {
    if (!selectedChat?.id || !workspaceMemberWithAgent?.agent?.id) return;

    sendClientChatMessage({
      clientChatId: selectedChat.id,
      from: workspaceMemberWithAgent.agent.id,
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
      providerIntegrationId:
        selectedChat?.whatsappIntegrationId ??
        selectedChat?.messengerIntegrationId ??
        selectedChat?.telegramIntegrationId ??
        '',
      reactions: null,
      repliesTo: null,
    });
    toggleDropdown();
  };

  const handleTransferToSector = (sector: Sector) => {
    if (!workspaceMemberWithAgent?.agent?.id || !selectedChat?.id) return;

    sendClientChatMessage({
      clientChatId: selectedChat.id,
      from: workspaceMemberWithAgent.agent.id,
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
      providerIntegrationId:
        selectedChat?.whatsappIntegrationId ??
        selectedChat?.messengerIntegrationId ??
        selectedChat?.telegramIntegrationId ??
        '',
      reactions: null,
      repliesTo: null,
    });
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
          {filteredWorkspaceMembersWithAgent.map((member: any) => (
            <TransferChatOption
              key={member.agentId}
              hasAvatar={true}
              agent={member}
              onClick={() => handleTransferToAgent(member)}
            />
          ))}
          {filteredWorkspaceMembersWithAgent.length === 0 && (
            <TransferChatOption
              LeftIcon={loading ? 'IconLoader2' : 'IconX'}
              text={t`${loading ? 'Loading...' : 'No agents transferable'}`}
            />
          )}
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
          {filteredSectors.map((sector) => (
            <TransferChatOption
              key={sector.id}
              text={sector.name}
              LeftIcon={sector.icon}
              onClick={() => handleTransferToSector(sector)}
            />
          ))}
          {filteredSectors.length === 0 && (
            <TransferChatOption
              LeftIcon={loading ? 'IconLoader2' : 'IconX'}
              text={t`${loading ? 'Loading...' : 'No sectors transferable'}`}
            />
          )}
        </>
      )}
    </>
  );
};

export const TRANSFER_CHAT_OPTIONS_DROPDOWN_ID =
  'transfer-chat-options-dropdown-id';

export const TransferChatDropdown = () => {
  const { getIcon } = useIcons();
  const IconArrowForwardUp = getIcon('IconArrowForwardUp');

  return (
    <Dropdown
      dropdownId={TRANSFER_CHAT_OPTIONS_DROPDOWN_ID}
      clickableComponent={
        <StyledIconButton
          variant="secondary"
          accent="blue"
          size="medium"
          Icon={(props) => <IconArrowForwardUp {...props} />}
        />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={<TransferChatDropdownContent />}
    />
  );
};
