import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { FormPhoneFieldInput } from '@/object-record/record-field/form-types/components/FormPhoneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { Modal } from '@/ui/layout/modal/components/Modal';

import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  H1Title,
  H1TitleFontColor,
  Section,
  SectionAlignment,
  SectionFontColor,
} from 'twenty-ui';

type StartChatProps = {
  isStartChatOpen: boolean;
  setIsStartChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPhoneUpdate: (phoneNumber: string | null) => void;
  onIntegrationUpdate: (integrationId: string | null) => void;
};

const StyledInitChatModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: calc(400px - ${({ theme }) => theme.spacing(32)});
`;

const StyledCenteredButton = styled(Button)`
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const StartChat = ({
  isStartChatOpen,
  setIsStartChatOpen,
  onPhoneUpdate,
  onIntegrationUpdate,
}: StartChatProps) => {
  // const { t } = useTranslation();

  const { activeWhatsappIntegrations } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;

  const [phone, setPhone] = useState<string>('');
  const [integrationId, setIntegrationId] = useState<string>('');
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);

  // const waIntegration = activeWhatsappIntegrations.map((integration) => ({
  //   label: integration.label,
  //   value: integration.id,
  // }));

  const waIntegration = useMemo(() => {
    return activeWhatsappIntegrations.map((integration) => ({
      label: integration.label,
      value: integration.id,
    }));
  }, [activeWhatsappIntegrations]);

  useEffect(() => {
    if (waIntegration.length === 1) {
      setIntegrationId(waIntegration[0].value);
    }
  }, [waIntegration]);

  const handlePhoneChange = (value: FieldPhonesValue) => {
    setPhone((prevPhone) => {
      const callingCode =
        value.primaryPhoneCallingCode || prevPhone.slice(0, 2) || '';

      const fullPhone = `${callingCode}${value.primaryPhoneNumber}`;

      return fullPhone;
    });

    setIsPhoneValid(value.primaryPhoneNumber.length >= 5);
  };

  const handleBusinessIdChange = (value: string | null) => {
    setIntegrationId(value ?? '');
  };

  const handleConfirm = () => {
    if (phone.length >= 5) {
      onPhoneUpdate(phone);
      onIntegrationUpdate(integrationId);
    } else {
      onPhoneUpdate(null);
      onIntegrationUpdate(null);
    }

    setIsStartChatOpen(false);
  };

  const handleCancel = () => {
    setPhone('');
    setIntegrationId('');
    onPhoneUpdate(null);
    onIntegrationUpdate(null);

    setIsStartChatOpen(false);
  };

  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        {isStartChatOpen && (
          <StyledInitChatModal isClosable onClose={handleCancel}>
            <StyledCenteredTitle>
              <H1Title
                title={'Start Conversation'}
                fontColor={H1TitleFontColor.Primary}
              />
            </StyledCenteredTitle>
            <StyledSection
              alignment={SectionAlignment.Center}
              fontColor={SectionFontColor.Primary}
            >
              {
                'This will start a conversation with a template, enter the number below'
              }
            </StyledSection>
            <StyledSection>
              <FormSelectFieldInput
                label="Inbox"
                defaultValue={integrationId}
                options={waIntegration}
                onPersist={handleBusinessIdChange}
              />
              <FormPhoneFieldInput onPersist={handlePhoneChange} />
            </StyledSection>
            <StyledCenteredButton
              onClick={handleConfirm}
              variant="primary"
              accent="blue"
              title={'Start conversation'}
              disabled={!isPhoneValid}
              fullWidth
              dataTestId="init-chat-modal-confirm-button"
            />
            <StyledCenteredButton
              onClick={handleCancel}
              variant="secondary"
              title={'Cancel'}
              fullWidth
            />
          </StyledInitChatModal>
        )}
      </LayoutGroup>
    </AnimatePresence>
  );
};
