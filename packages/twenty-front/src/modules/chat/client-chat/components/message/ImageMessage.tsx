import styled from '@emotion/styled';
import {
  ChatMessageDeliveryStatus,
  ClientChatMessage,
} from 'twenty-shared/types';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../../constants/attemptingMessageKeyframes';

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

const ImageMessage = ({
  message,
  onClick,
}: {
  message: ClientChatMessage;
  onClick: () => void;
}) => {
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;
  const imageUrl = message.attachmentUrl;
  const fullImageUrl = REACT_APP_SERVER_BASE_URL + '/files/' + imageUrl;

  return (
    <StyledImageContainer onClick={onClick} isPending={isPending}>
      <StyledImageImg
        isPending={isPending}
        src={fullImageUrl}
        width="100%"
        height="100%"
      />
    </StyledImageContainer>
  );
};

export default ImageMessage;
