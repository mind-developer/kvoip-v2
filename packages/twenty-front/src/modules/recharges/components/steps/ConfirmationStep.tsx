/* @kvoip-woulz proprietary */
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';

import type { RechargeFormData } from '../../types/recharge-form.types';
import { RechargeDisplayBox } from '../RechargeDisplayBox';
import { Button } from 'twenty-ui/input';

const StyledFormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

type ConfirmationStepProps = {
  formData: RechargeFormData;
  onFormDataChange: (data: Partial<RechargeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export const ConfirmationStep = ({
  formData,
  onFormDataChange,
  onNext,
  onBack,
}: ConfirmationStepProps) => {
  const isStepValid =
    formData.company.length > 0 && formData.amount.length > 0;

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = (Number(numbers) / 100).toFixed(2);
    onFormDataChange({ amount: formatted });
  };

  return (
    <>
      <StyledFormSection>
        <RechargeDisplayBox label="Documento" value={formData.document} />

        <TextInput
          label="Empresa Encontrada"
          value={formData.company}
          onChange={(value) => onFormDataChange({ company: value })}
          placeholder="Nome da empresa"
          fullWidth
        />
      </StyledFormSection>

      <StyledFormSection>
        <TextInput
          label="Valor da Recarga"
          value={formData.amount}
          onChange={handleAmountChange}
          placeholder="R$ 0,00"
          fullWidth
        />
      </StyledFormSection>

      <StyledButtonGroup>
        <Button
          title="Voltar"
          variant="secondary"
          onClick={onBack}
          fullWidth
        />
        <Button
          title="Continuar"
          variant="primary"
          accent="blue"
          onClick={onNext}
          disabled={!isStepValid}
          fullWidth
        />
      </StyledButtonGroup>
    </>
  );
};

