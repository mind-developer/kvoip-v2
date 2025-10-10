import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { ClientChatWithPerson } from '@/chat/call-center/hooks/useClientChatsWithPerson';
import { isMessageFromAgent } from '@/chat/call-center/utils/clientChatMessageHelpers';
import { getCleanName } from '@/chat/call-center/utils/getCleanName';

import styled from '@emotion/styled';
import { ClientChatMessage } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/display';

interface WhatsappProps {
  message: ClientChatMessage;
  selectedChat: ClientChatWithPerson;
  currentWorkspaceMember: CurrentWorkspaceMember;
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
  const fromMe = isMessageFromAgent(message);

  console.log(selectedChat);
  return (
    <Avatar
      avatarUrl={
        fromMe
          ? currentWorkspaceMember?.avatarUrl
          : selectedChat.person?.avatarUrl
      }
      placeholder={selectedChat.person.firstName?.replace('_', '') ?? ''}
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
