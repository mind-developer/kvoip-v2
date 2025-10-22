/* @kvoip-woulz proprietary */
import { ServiceCenterTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterTabContent';
import { useFindAllTelephonys } from '@/settings/service-center/telephony/hooks/useFindAllTelephony';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal, type ModalVariants } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconArrowMerge, IconArrowRight, IconCheck, IconPhone, IconSearch, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';

interface TransferModalProps {
  modalId: string;
  onClose?: () => void;
  modalVariant?: ModalVariants;
  onTransfer: (extension: string, type: 'blind' | 'attended') => void;
}

type TransferType = 'blind' | 'attended';

const StyledTransferModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
`;

const StyledCard = styled(Card)`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  
  svg {
    transform: translateY(-8px);
  }
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  justify-content: flex-end;
`;

const StyledTransferModeButtonGroup = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  gap: 2px;
  padding: 2px;
  backdrop-filter: blur(20px);

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

const StyledTransferModeButton = styled.button<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: none;
  background-color: ${({ isSelected, theme }) => 
    isSelected ? theme.color.blue : 'transparent'};
  color: ${({ isSelected, theme }) => 
    isSelected ? theme.font.color.inverted : theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  cursor: pointer;
  transition: all 0.1s ease;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  white-space: nowrap;
  flex: 1;

  &:hover {
    background-color: ${({ isSelected, theme }) => 
      isSelected ? theme.color.blue : theme.background.transparent.light};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.color.blue};
    outline-offset: 2px;
  }
`;

const TransferModal: React.FC<TransferModalProps> = ({ 
  modalId, 
  onClose, 
  modalVariant = 'primary',
  onTransfer
}) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { closeModal } = useModal();
  const { t } = useLingui();
  
  // Estados do formulário
  const [extensionNumber, setExtensionNumber] = useState<string>('');
  const [transferType, setTransferType] = useState<TransferType>('blind');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Buscar telefonia (ramais vinculados aos membros)
  const { telephonys, loading: telephonyLoading, refetch } = useFindAllTelephonys();

  // Função para lidar com a seleção de uma extensão
  const handleExtensionSelect = (telephony: Telephony) => {
    setExtensionNumber(telephony.numberExtension || '');
  };

  const handleTransfer = () => {
    if (!extensionNumber.trim()) {
      enqueueErrorSnackBar({
        message: t`Please enter an extension number`,
      });
      return;
    }

    console.log('Transferindo chamada:', { extensionNumber, transferType });
    onTransfer(extensionNumber.trim(), transferType);
    
    enqueueSuccessSnackBar({
      message: `Transferência ${transferType === 'blind' ? 'cega' : 'assistida'} iniciada para ${extensionNumber}`,
    });
    
    closeModal(modalId);
  };

  const handleCancel = () => {
    setExtensionNumber('');
    setTransferType('blind');
    setSearchTerm('');
    closeModal(modalId);
    onClose?.();
  };

  return (
    <StyledTransferModal
      modalId={modalId}
      onClose={handleCancel}
      isClosable={true}
      padding="large"
      modalVariant={modalVariant}
      size="medium"
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <StyledContainer>
        <StyledHeader>
          <StyledTitle>
            <IconArrowRight size={24} />
            <H1Title 
              title={t`Transfer Call`} 
              fontColor={H1TitleFontColor.Primary} 
            />
          </StyledTitle>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancel();
            }}
            variant="tertiary"
            Icon={IconX}
            size="medium"
          />
        </StyledHeader>

        <StyledFormSection>
          {/* Tipo de Transferência */}
          <StyledFormGroup>
            <InputLabel>{t`Transfer Type`}</InputLabel>
            <StyledTransferModeButtonGroup role="radiogroup" aria-label="Modo de transferência">
              <StyledTransferModeButton
                isSelected={transferType === 'blind'}
                onClick={() => setTransferType('blind')}
                role="radio"
                aria-checked={transferType === 'blind'}
                aria-label="Transferência às cegas: Transferência direta"
                title="Transferência às cegas: Transferência direta"
              >
                <IconPhone size={16} />
                {t`Blind Transfer`}
              </StyledTransferModeButton>
              <StyledTransferModeButton
                // isSelected={transferType === 'attended'}
                isSelected={false}
                // onClick={() => setTransferType('attended')}
                onClick={() => {
                  enqueueErrorSnackBar({
                    message: t`Attended is disabled temporarily`,
                  });
                }}
                role="radio"
                aria-checked={transferType === 'attended'}
                aria-label="Attended Transfer: Confirm before transferring"
                title="Attended Transfer: Confirm before transferring"
                
              >
                <IconArrowMerge size={16} />
                {t`Attended Transfer`}
              </StyledTransferModeButton>
            </StyledTransferModeButtonGroup>
          </StyledFormGroup>

          {/* Input de Extensão */}
          <StyledFormGroup>
            <InputLabel>{t`Extension Number`}</InputLabel>
            <TextInput
              value={extensionNumber}
              onChange={setExtensionNumber}
              placeholder={t`Enter extension number`}
              LeftIcon={IconPhone}
            />
          </StyledFormGroup>

          {/* Lista de Extensões */}
          <StyledCard>
            <StyledFormGroup>
              <InputLabel>{t`Available Extensions`}</InputLabel>
              <TextInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t`Search extensions...`}
                LeftIcon={IconSearch}
              />
              
              <ServiceCenterTabContent
                telephonys={telephonys || []}
                searchTerm={searchTerm}
                refetch={refetch}
                disableActions={true}
                onExtensionSelect={handleExtensionSelect}
                loading={telephonyLoading}
                markSelectedItem
              />
            </StyledFormGroup>
          </StyledCard>
        </StyledFormSection>

        <StyledButtonContainer>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancel();
            }}
            variant="secondary"
            title={t`Cancel`}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTransfer();
            }}
            Icon={IconCheck}
            variant="primary"
            accent="blue"
            title={t`Transfer Call`}
            disabled={!extensionNumber.trim()}
          />
        </StyledButtonContainer>
      </StyledContainer>
    </StyledTransferModal>
  );
};

export default TransferModal;

