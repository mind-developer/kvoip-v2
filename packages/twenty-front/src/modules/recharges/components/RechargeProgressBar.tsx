/* @kvoip-woulz proprietary */
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const diagonalLinesAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
`;

const StyledStepLine = styled.div<{ isCompleted: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: ${({ theme }) => theme.border.color.secondaryInverted};
`;

const StyledStepLineCompleted = styled.div<{ width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  background: ${({ theme }) => theme.color.blue50};
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    ${({ theme }) => theme.color.blue40} 10px,
    ${({ theme }) => theme.color.blue40} 14px
  );
  background-size: 20px 20px;
  background-position: 0 0;
  animation: ${diagonalLinesAnimation} 1s linear infinite;
  width: ${(props) => props.width}%;
  transition: width 0.3s ease;
  border-radius: ${({ theme }) => theme.border.radius.pill};
  overflow: hidden;
`;

type RechargeProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export const RechargeProgressBar = ({
  currentStep,
  totalSteps,
}: RechargeProgressBarProps) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <>
      <StyledStepLine isCompleted={false} />
      <StyledStepLineCompleted width={progressPercentage} />
    </>
  );
};

