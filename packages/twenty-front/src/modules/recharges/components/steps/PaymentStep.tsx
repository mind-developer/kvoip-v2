/* @kvoip-woulz proprietary */
import { Button } from 'twenty-ui/input';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';

import { RechargeDisplayBox } from '../RechargeDisplayBox';
import type { RechargeFormData } from '../../types/recharge-form.types';

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

type PaymentStepProps = {
  formData: RechargeFormData;
  onFormDataChange: (data: Partial<RechargeFormData>) => void;
  onBack: () => void;
};

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
];

export const PaymentStep = ({
  formData,
  onFormDataChange,
  onBack,
}: PaymentStepProps) => {
  const isStepValid = formData.paymentMethod.length > 0;

  return (
    <>
      <StyledFormSection>
        <RechargeDisplayBox label="Empresa" value={formData.company} />
        <RechargeDisplayBox label="Documento" value={formData.document} />
        <RechargeDisplayBox
          label="Valor"
          value={`R$ ${formData.amount}`}
          isLarge
        />
      </StyledFormSection>

      <StyledFormSection>
        <Select
          label="Método de Pagamento"
          dropdownId="payment-method-select"
          value={formData.paymentMethod}
          onChange={(value) => onFormDataChange({ paymentMethod: value })}
          options={PAYMENT_METHODS}
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
          title="Confirmar Recarga"
          variant="primary"
          accent="blue"
          disabled={!isStepValid}
          fullWidth
        />
      </StyledButtonGroup>
    </>
  );
};

