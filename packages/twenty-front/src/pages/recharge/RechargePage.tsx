/* @kvoip-woulz proprietary */
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  min-height: 400px;
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
`;

export const RechargePage = () => {
  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <StyledContent>
        <StyledTitle>Recarga</StyledTitle>
        <StyledDescription>
          Página de recarga - funcionalidade em desenvolvimento
        </StyledDescription>
      </StyledContent>
    </Modal.Content>
  );
};

