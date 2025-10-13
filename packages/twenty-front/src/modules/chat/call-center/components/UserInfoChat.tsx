import { getCleanName } from '@/chat/call-center/utils/getCleanName';

import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

export const AvatarComponent = ({
  avatarUrl,
  senderName,
}: {
  avatarUrl: string;
  senderName: string;
}) => {
  return (
    <Avatar
      avatarUrl={avatarUrl}
      placeholder={senderName}
      placeholderColorSeed={senderName}
      type={'rounded'}
      size="lg"
    />
  );
};

export const UsernameComponent = ({ senderName }: { senderName: string }) => {
  return (
    <StyledUserName
      style={{
        margin: 0,
      }}
    >
      {getCleanName(senderName)}
    </StyledUserName>
  );
};
