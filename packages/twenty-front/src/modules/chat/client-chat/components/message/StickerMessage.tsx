import styled from '@emotion/styled';
import { ClientChatMessage } from 'twenty-shared/types';

const StyledStickerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
`;

const StyledStickerImg = styled.img`
  width: 180px;
  height: 180px;
  align-self: center;
`;

export const StickerMessage = ({ message }: { message: ClientChatMessage }) => {
  const stickerUrl = message.attachmentUrl;
  return (
    <StyledStickerContainer>
      <StyledStickerImg src={stickerUrl!} />
    </StyledStickerContainer>
  );
};
