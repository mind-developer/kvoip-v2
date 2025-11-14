/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';

const StyledDisplayBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDisplayLabel = styled.p`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDisplayValue = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDisplayValueLarge = styled(StyledDisplayValue)`
  font-size: ${({ theme }) => theme.font.size.xl};
  color: ${({ theme }) => theme.color.blue};
`;

type RechargeDisplayBoxProps = {
  label: string;
  value: string;
  isLarge?: boolean;
};

export const RechargeDisplayBox = ({
  label,
  value,
  isLarge = false,
}: RechargeDisplayBoxProps) => {
  return (
    <StyledDisplayBox>
      <StyledDisplayLabel>{label}</StyledDisplayLabel>
      {isLarge ? (
        <StyledDisplayValueLarge>{value}</StyledDisplayValueLarge>
      ) : (
        <StyledDisplayValue>{value}</StyledDisplayValue>
      )}
    </StyledDisplayBox>
  );
};

