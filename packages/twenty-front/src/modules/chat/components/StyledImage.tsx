import { IMessage } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../call-center/constants/ATTEMPTING_MESSAGE_KEYFRAMES';
import { MessageStatus } from '../call-center/types/MessageStatus';

const StyledImageContainer = styled.div<{ status: MessageStatus }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ status }) =>
    status === 'attempting' ? ATTEMPTING_MESSAGE_KEYFRAMES : ''}
  overflow: hidden;
  border-radius: ${({ theme }) => theme.spacing(3)};
`;
const StyledImageImg = styled.img<{ status: MessageStatus }>`
  ${({ status }) =>
    status === 'attempting' ? ATTEMPTING_MESSAGE_KEYFRAMES : ''};
  filter: ${({ status }) => (status === 'attempting' ? 'blur(10px)' : 'none')};
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
  message: IMessage;
  onClick: () => void;
}) => {
  return (
    <StyledImageContainer onClick={onClick} status={message.status}>
      <StyledImageImg
        status={message.status}
        src={message.message}
        width="100%"
        height="100%"
      />
    </StyledImageContainer>
  );
};

export default StyledImage;
