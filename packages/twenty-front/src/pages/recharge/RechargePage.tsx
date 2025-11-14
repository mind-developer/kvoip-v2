/* @kvoip-woulz proprietary */
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import {
  RechargeForm,
  RechargeProgressBar,
} from '@/recharges/components';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

const StyledDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(10)};
  margin-top: ${({ theme }) => theme.spacing(0)};
`;

const StyledModalContent = styled(Modal.Content)`
  padding-top: ${({ theme }) => theme.spacing(5)};
  position: relative;
`;

const StyledFooterContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 280px;
  text-align: center;

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const RechargePage = () => {
  const { t } = useLingui();
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    { key: 'document', label: t`Document` },
    { key: 'confirmation', label: t`Confirmation` },
    { key: 'recharge', label: t`Recharge` },
  ];

  return (
    <StyledModalContent isVerticalCentered isHorizontalCentered>
      <RechargeProgressBar
        currentStep={currentStep}
        totalSteps={STEPS.length}
      />

      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>

      <Title animate>{t`Recharge System`}</Title>
      <StyledDescription> {t`Top up your balance quickly and securely.`}</StyledDescription>

      <RechargeForm currentStep={currentStep} setCurrentStep={setCurrentStep} steps={STEPS} />

      <StyledFooterContainer>
        {t`Know Woulz, the high-performance CRM`}{'. '}
        <a href="https://woulz.com" target="_blank" rel="noopener noreferrer">
          {t`Click here to learn more`}{'.'}
        </a>
      </StyledFooterContainer>
    </StyledModalContent>
  );
};
