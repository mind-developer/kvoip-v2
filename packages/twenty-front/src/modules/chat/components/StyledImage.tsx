import { getMessageContent } from '@/chat/call-center/utils/clientChatMessageHelpers';
import styled from '@emotion/styled';
import {
  ChatMessageDeliveryStatus,
  ClientChatMessage,
} from 'twenty-shared/types';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../call-center/constants/ATTEMPTING_MESSAGE_KEYFRAMES';

const StyledImageContainer = styled.div<{ isPending: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ isPending }) => (isPending ? ATTEMPTING_MESSAGE_KEYFRAMES : '')}
  overflow: hidden;
  border-radius: ${({ theme }) => theme.spacing(3)};
`;
const StyledImageImg = styled.img<{ isPending: boolean }>`
  ${({ isPending }) => (isPending ? ATTEMPTING_MESSAGE_KEYFRAMES : '')};
  filter: ${({ isPending }) => (isPending ? 'blur(10px)' : 'none')};
  z-index: 1;
  min-width: 150px;
  min-height: 150px;
  transition: transform 0.05s ease-out;
  overflow: hidden;
  &:hover {
    cursor: pointer;
  }
  &:active {
    transform: scale(0.98);
  }
`;

const StyledImage = ({
  message,
  onClick,
}: {
  message: ClientChatMessage;
  onClick: () => void;
}) => {
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;
  const imageUrl = getMessageContent(message);

  return (
    <StyledImageContainer onClick={onClick} isPending={isPending}>
      <StyledImageImg
        isPending={isPending}
        src={imageUrl}
        width="100%"
        height="100%"
      />
    </StyledImageContainer>
  );
};

export default StyledImage;
