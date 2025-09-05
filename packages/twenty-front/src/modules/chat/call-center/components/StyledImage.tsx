import { IMessage } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../constants/ATTEMPTING_MESSAGE_KEYFRAMES';
import { MessageStatus } from '../types/MessageStatus';

const StyledImageContainer = styled.div<{ status: MessageStatus }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ status }) =>
    status === 'attempting' ? ATTEMPTING_MESSAGE_KEYFRAMES : ''}
`;
const StyledImage = (message: { message: IMessage }) => {
  return (
    <StyledImageContainer status={message.status}>
      <img src={message.message} width="100%" height="100%" />
    </StyledImageContainer>
  );
};

export default StyledImage;
