import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Button } from 'twenty-ui/input';

type ChatbotFlowEventContainerFormProps = {
  children: ReactNode;
  onClick?: () => void;
};

const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  flex: 1;
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
