/* @kvoip-woulz proprietary */
import { useState } from 'react';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import styled from '@emotion/styled';

import { ConfirmationStep } from './steps/ConfirmationStep';
import { DocumentStep } from './steps/DocumentStep';
import { PaymentStep } from './steps/PaymentStep';
import type {
  DocumentType,
  RechargeFormData,
} from '../types/recharge-form.types';

const StyledContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const StyledStepsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

export const RechargeForm = ({
  currentStep,
  setCurrentStep,
  steps,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: { key: string; label: string }[];
}) => {
  
  const [formData, setFormData] = useState<RechargeFormData>({
    documentType: 'CPF',
    document: '',
    company: '',
    amount: '',
    paymentMethod: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (data: Partial<RechargeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
          />
        );

      case 1:
        return (
          <ConfirmationStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 2:
        return (
          <PaymentStep
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <StyledContainer>
      <StyledStepsContainer>
        <StepBar activeStep={currentStep}>
          {steps.map((step) => (
            <StepBar.Step key={step.key} label={step.label} />
          ))}
        </StepBar>
      </StyledStepsContainer>

      {renderStepContent()}
    </StyledContainer>
  );
};

