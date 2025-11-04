import { CachedAvatarComponent } from '@/chat/client-chat/components/message/CachedAvatarComponent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { ChatMessageFromType, ChatMessageType } from 'twenty-shared/types';
import { IconX } from 'twenty-ui/display';

const StyledMessageQuotePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  border-left: 3px solid ${({ theme }) => theme.color.blue30};
  border-radius: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  background-color: rgba(255, 255, 255, 0.05);
  position: relative;
  &:hover {
    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(6)};
  border: none;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.tertiary};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  padding: ${({ theme }) => theme.spacing(1)};
  z-index: 1;

  &:hover {
    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)'};
    color: ${({ theme }) => theme.font.color.secondary};
  }

  &:active {
    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.1)'};
  }
`;

export const MessageQuotePreview = ({
  messageId,
  onScrollToMessage,
  onClose,
}: {
  messageId: string;
  onScrollToMessage?: (messageId: string) => void;
  onClose?: () => void;
}) => {
  const theme = useTheme();
  const { record: referencedMessage } = useFindOneRecord({
    objectNameSingular: 'clientChatMessage',
    objectRecordId: messageId,
  });

  if (!referencedMessage) {
    return null;
  }

  const handleClick = () => {
    if (onScrollToMessage && messageId) {
      onScrollToMessage(messageId);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <StyledMessageQuotePreview onClick={handleClick}>
      {onClose && (
        <StyledCloseButton onClick={handleCloseClick} type="button">
          <IconX size={theme.icon.size.sm * 3} />
        </StyledCloseButton>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(1),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
        >
          <CachedAvatarComponent
            senderId={referencedMessage.from}
            senderType={referencedMessage.fromType}
            animateDelay={0}
            showName={true}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
          }}
        >
          {referencedMessage.type === ChatMessageType.IMAGE && (
            <ImagePreview
              imageUrl={referencedMessage.attachmentUrl ?? ''}
              type={referencedMessage.type}
            />
          )}
          {referencedMessage.type === ChatMessageType.STICKER && (
            <ImagePreview
              imageUrl={referencedMessage.attachmentUrl ?? ''}
              type={referencedMessage.type}
            />
          )}
          {referencedMessage.type === ChatMessageType.TEXT && (
            <StyledTextBody>
              {referencedMessage.fromType === ChatMessageFromType.PERSON
                ? referencedMessage.textBody
                : referencedMessage.textBody?.split('\n').slice(1).join('\n')}
            </StyledTextBody>
          )}
        </div>
      </div>
    </StyledMessageQuotePreview>
  );
};

const ImagePreview = ({
  imageUrl,
  type,
}: {
  imageUrl: string;
  type: ChatMessageType;
}) => {
  const theme = useTheme();
  const { t } = useLingui();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(1),
        aspectRatio: '1/1',
        overflow: 'hidden',
        width: '100%',
        height: 30,
        borderRadius: theme.border.radius.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <img
        src={imageUrl}
        alt="Image"
        style={{
          width: 30,
          height: 30,
          aspectRatio: '1/1',
          objectFit: 'cover',
        }}
      />
      <StyledTextBody>
        {type === ChatMessageType.IMAGE ? t`Image` : t`Sticker`}
      </StyledTextBody>
    </div>
  );
};

const StyledTextBody = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
