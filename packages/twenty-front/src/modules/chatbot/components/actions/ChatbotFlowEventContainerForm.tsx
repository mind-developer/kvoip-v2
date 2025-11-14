import styled from '@emotion/styled';
import { type ReactNode } from 'react';

type ChatbotFlowEventContainerFormProps = {
  children: ReactNode;
  onClick?: () => void;
};

const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: visible;
  position: relative;
`;

const StyledContent = styled.div`
  flex: 1;
  overflow-x: visible;
  overflow-y: visible;
  position: relative;
  width: 100%;
`;

export const ChatbotFlowEventContainerForm = ({
  children,
}: ChatbotFlowEventContainerFormProps) => {
  return (
    <StyledWrapper>
      <StyledContent>{children}</StyledContent>
    </StyledWrapper>
  );
};
