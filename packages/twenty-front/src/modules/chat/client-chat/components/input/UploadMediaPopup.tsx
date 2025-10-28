/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dispatch, SetStateAction } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChat,
} from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/display';

interface UploadMediaPopupProps {
  setIsUploadMediaPopupOpen: Dispatch<SetStateAction<boolean>>;
  clientChat: ClientChat;
}

interface LabelProps {
  isImage?: boolean;
}

const StyledMainContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 50px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 180px;
  z-index: 10;
`;

const StyledLabel = styled.label<LabelProps>`
  display: flex;
  padding: 6px 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.secondary};
  border-top-right-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-top-left-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-bottom-right-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};
  border-bottom-left-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};

  &:hover {
    background-color: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledInput = styled.input`
  display: none;
`;

export const UploadMediaPopup = ({
  setIsUploadMediaPopupOpen,
  clientChat,
}: UploadMediaPopupProps) => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { sendClientChatMessage } = useSendClientChatMessage();
  const workspaceId = useRecoilValue(currentWorkspaceState)?.id;

  const { getIcon } = useIcons();
  const theme = useTheme();

  const DocIcon = getIcon('IconFile');
  const ImageIcon = getIcon('IconCamera');
  const VideoIcon = getIcon('IconVideo');

  const handleSendFile = async (file: File, type: ChatMessageType) => {
    if (!clientChat.person.id) {
      return;
    }
    const attachment = await uploadAttachmentFile(file, {
      targetObjectNameSingular: CoreObjectNameSingular.Person,
      id: clientChat.person.id,
    });

    if (attachment) {
      sendClientChatMessage({
        clientChatId: clientChat.id,
        attachmentUrl: attachment.attachmentAbsoluteURL,
        type: type,
        from: clientChat.agent.id || '',
        fromType: ChatMessageFromType.AGENT,
        to: clientChat.person.id,
        toType: ChatMessageToType.PERSON,
        provider: ChatIntegrationProvider.WHATSAPP,
        deliveryStatus: ChatMessageDeliveryStatus.PENDING,
        providerIntegrationId:
          clientChat.whatsappIntegrationId ||
          clientChat.messengerIntegrationId ||
          clientChat.telegramIntegrationId ||
          '',
      });
      setIsUploadMediaPopupOpen(false);
    }
  };

  return (
    <StyledMainContainer>
      <StyledLabel
        isImage
        style={{
          borderBottom: `1px solid ${theme.border.color.medium}`,
        }}
      >
        <ImageIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Image
        <StyledInput
          type="file"
          accept=".bmp,.csv,.odt,.doc,.docx,.htm,.html,.jpg,.jpeg,.pdf,.ppt,.pptx,.txt,.xls,.xlsx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSendFile(file, ChatMessageType.IMAGE);
              setIsUploadMediaPopupOpen(false);
            }
          }}
        />
      </StyledLabel>
      {clientChat && (
        <StyledLabel
          isImage
          style={{
            borderBottom: `1px solid ${theme.border.color.medium}`,
          }}
        >
          <VideoIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.primary}
            style={{ marginRight: theme.spacing(2) }}
          />
          Video
          <StyledInput
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleSendFile(file, ChatMessageType.VIDEO);
                setIsUploadMediaPopupOpen(false);
              }
            }}
          />
        </StyledLabel>
      )}
      <StyledLabel>
        <DocIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Document
        <StyledInput
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSendFile(file, ChatMessageType.DOCUMENT);
              setIsUploadMediaPopupOpen(false);
            }
          }}
        />
      </StyledLabel>
    </StyledMainContainer>
  );
};
