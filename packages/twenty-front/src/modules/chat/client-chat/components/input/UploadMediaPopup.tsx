/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { type Dispatch, type SetStateAction } from 'react';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  type ClientChat,
} from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/display';

interface UploadMediaPopupProps {
  setIsUploadMediaPopupOpen: Dispatch<SetStateAction<boolean>>;
  clientChat: ClientChat;
}

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

const popupItems = [
  {
    icon: 'IconCamera',
    label: 'Image',
    accept: 'image/*',
    type: ChatMessageType.IMAGE,
  },
  {
    icon: 'IconVideo',
    label: 'Video',
    accept: 'video/*',
    type: ChatMessageType.VIDEO,
  },
  {
    icon: 'IconFile',
    label: 'Document',
    accept:
      'application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain',
    type: ChatMessageType.DOCUMENT,
  },
] as const;

const StyledMainContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  opacity: 0.8;

  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 60px;
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 10;
`;

const StyledLabel = styled(motion.div)`
  display: flex;
  padding: 6px 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.secondary};

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
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const theme = useTheme();

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
        from: clientChat.agentId || '',
        fromType: ChatMessageFromType.AGENT,
        to: clientChat.personId ?? clientChat.person?.id ?? '',
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: ChatMessageType,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        enqueueErrorSnackBar({
          message: t`File size exceeds the maximum limit of 16MB`,
        });
        return;
      }
      handleSendFile(file, type);
      setIsUploadMediaPopupOpen(false);
    }
  };

  return (
    <StyledMainContainer
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'fit-content', opacity: 1 }}
      transition={{
        duration: 0.8,
        /* @kvoip-woulz proprietary:begin */
        // Add spring bounce for upload popup opening animation
        type: 'spring',
        bounce: 0.2,
      }}
    >
      {popupItems.map((item, index) => {
        const IconComponent = getIcon(item.icon);

        return (
          <StyledLabel
            key={item.label}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              transition: { delay: index * 0.08, type: 'spring', bounce: 0.2 },
            }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0, 0.81, 0.27, 1] }}
          >
            <IconComponent
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.primary}
              style={{ marginRight: theme.spacing(2) }}
            />
            {item.label}
            <StyledInput
              type="file"
              accept={item.accept}
              onChange={(e) => handleFileChange(e, item.type)}
            />
          </StyledLabel>
        );
      })}
    </StyledMainContainer>
  );
};
