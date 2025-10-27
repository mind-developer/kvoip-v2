import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TransferChatDropdown } from '@/chat/client-chat/components/layout/TransferChatDropdown';
import { CHAT_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatHeaderModalId';
import { useClientChats } from '@/chat/client-chat/hooks/useClientChats';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconBrandMeta, IconDeviceMobileMessage } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Avatar, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledChatTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0 ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-right: 8px;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: 5px;
  width: 24px;
  min-width: 24px;
`;
const StyledIntegrationCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  display: flex;
  padding: 3px ${({ theme }) => theme.spacing(1)};
  width: max-content;
  margin-right: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};

  & img {
    height: 10px;
    margin-right: ${({ theme }) => theme.spacing(1)};
    width: 10px;
  }
  font-size: 10px;
`;

export const ChatHeader = ({
  name,
  avatarUrl,
  personId,
  showCloseOptions,
}: {
  name: string;
  avatarUrl: string;
  personId: string;
  showCloseOptions: boolean;
}) => {
  const { chatId } = useParams();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const navigate = useNavigate();

  const { toggleModal } = useModal();

  const { sendClientChatMessage } = useSendClientChatMessage();
  const workspaceId = useRecoilValue(currentWorkspaceState)?.id;
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const { chats: clientChats } = useClientChats();
  const selectedChat = clientChats.find(
    (chat: ClientChat) => chat.id === chatId,
  );

  const IconX = getIcon('IconX');
  const IconDotsVertical = getIcon('IconDotsVertical');

  if (personId)
    return (
      <>
        <StyledChatHeader>
          <StyledDiv>
            <Avatar
              avatarUrl={avatarUrl}
              placeholder={name}
              size="xl"
              type={'rounded'}
              placeholderColorSeed={name}
            />
            <StyledChatTitle
              onClick={() => navigate(`/object/person/${personId}`)}
            >
              {name}
            </StyledChatTitle>
            {selectedChat?.whatsappIntegration?.apiType && (
              <StyledIntegrationCard>
                {selectedChat?.whatsappIntegration?.apiType === 'MetaAPI' ? (
                  <IconBrandMeta size={10} />
                ) : (
                  <IconDeviceMobileMessage size={10} />
                )}
                WhatsApp ({selectedChat?.whatsappIntegration?.apiType})
              </StyledIntegrationCard>
            )}
          </StyledDiv>
          <StyledActionsContainer>
            {showCloseOptions && (
              <StyledIconButton
                onClick={() => toggleModal(CHAT_HEADER_MODAL_ID)}
                variant="secondary"
                accent="danger"
                size="medium"
                Icon={(props) => (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <IconX {...props} />
                )}
              />
            )}
            <TransferChatDropdown />
            <StyledIconButton
              onClick={() => navigate(`/object/person/${personId}`)}
              variant="secondary"
              accent="default"
              size="medium"
              Icon={(props) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <IconDotsVertical {...props} />
              )}
            />
          </StyledActionsContainer>
        </StyledChatHeader>
        <ConfirmationModal
          modalId={CHAT_HEADER_MODAL_ID}
          title={'Close service'}
          subtitle={
            <>
              {t`This will end the chat and change the status of the service to finished`}
            </>
          }
          onConfirmClick={() => {
            sendClientChatMessage({
              clientChatId: chatId || '',
              from: workspaceMemberWithAgent?.agent?.id || '',
              fromType: ChatMessageFromType.AGENT,
              to: workspaceMemberWithAgent?.agent?.sectorId || '',
              toType: ChatMessageToType.SECTOR,
              provider: ChatIntegrationProvider.WHATSAPP,
              type: ChatMessageType.EVENT,
              textBody: null,
              caption: null,
              deliveryStatus: ChatMessageDeliveryStatus.SENT,
              edited: null,
              attachmentUrl: null,
              event: ClientChatMessageEvent.END,
              workspaceId: workspaceId || '',
              providerIntegrationId: selectedChat?.whatsappIntegrationId ?? '',
              reactions: null,
              repliesTo: null,
            });
          }}
          confirmButtonText={'Close'}
        />
      </>
    );
};
