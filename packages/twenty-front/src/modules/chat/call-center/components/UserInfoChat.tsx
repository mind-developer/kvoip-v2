import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { getCleanName } from '@/chat/call-center/utils/getCleanName';

import { IMessage, WhatsappDocument } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

interface WhatsappProps {
  message: IMessage;
  selectedChat?: WhatsappDocument;
  currentWorkspaceMember?: CurrentWorkspaceMember | null;
}

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

export const AvatarComponent: React.FC<WhatsappProps> = ({
  message,
  selectedChat,
  currentWorkspaceMember,
}) => {
  return (
    <Avatar
      avatarUrl={
        message.fromMe
          ? currentWorkspaceMember?.avatarUrl
          : selectedChat?.client.ppUrl
      }
      placeholder={message.from?.replace('_', '') ?? ''}
      placeholderColorSeed={message.from?.replace('_', '') ?? ''}
      type={'rounded'}
      size="lg"
    />
  );
};

export const UsernameComponent: React.FC<WhatsappProps> = ({ message }) => {
  return (
    <StyledUserName
      style={{
        margin: 0,
      }}
    >
      {getCleanName(message.from)}
    </StyledUserName>
  );
};
