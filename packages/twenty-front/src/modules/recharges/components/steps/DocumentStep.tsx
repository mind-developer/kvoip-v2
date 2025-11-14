/* @kvoip-woulz proprietary */

import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { MainButton } from 'twenty-ui/input';

import { Loader } from 'twenty-ui/feedback';
import type { DocumentType, RechargeFormData } from '../../types/recharge-form.types';
import { useLingui } from '@lingui/react/macro';

const StyledFormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonOption = styled.button<{ isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.medium};
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blueAccent20 : theme.background.primary};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.light};
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

type DocumentStepProps = {
  formData: RechargeFormData;
  onFormDataChange: (data: Partial<RechargeFormData>) => void;
  onNext: () => void;
};

const formatDocument = (value: string, type: DocumentType): string => {
  const numbers = value.replace(/\D/g, '');
  if (type === 'CPF') {
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    return numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

export const DocumentStep = ({
  formData,
  onFormDataChange,
  onNext,
}: DocumentStepProps) => {
  const isStepValid = formData.document.length >= 14;
  const { t } = useLingui();

  return (
    <>
      {/* <StyledFormSection>
        <StyledLabel>Tipo de Documento</StyledLabel>
        <StyledButtonGroup>
          <StyledButtonOption
            isSelected={formData.documentType === 'CPF'}
            onClick={() =>
              onFormDataChange({
                documentType: 'CPF',
                document: '',
              })
            }
          >
            CPF
          </StyledButtonOption>
          <StyledButtonOption
            isSelected={formData.documentType === 'CNPJ'}
            onClick={() =>
              onFormDataChange({
                documentType: 'CNPJ',
                document: '',
              })
            }
          >
            CNPJ
          </StyledButtonOption>
        </StyledButtonGroup>
      </StyledFormSection> */}

      <StyledFormSection>
        <TextInput
          label={t`Pesquise pelo CPF ou CNPJ da empresa`}
          value={formData.document}
          placeholder={`000.000.000-00 ${t`or`} 00.000.000/0000-00`}
          fullWidth
        />
      </StyledFormSection>

      <StyledButtonContainer>
        <MainButton
          disabled={false}
          title={t`Search Company`}
          onClick={() => onNext()}
          variant={'primary'}
          Icon={() => (false ? <Loader /> : null)}
          width={250}
        />
      </StyledButtonContainer>
    </>
  );
};

