import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useGetWhatsappTemplates } from '@/chat/client-chat/hooks/useGetWhatsappTemplates';
import { useSendTemplateMessage } from '@/chat/client-chat/hooks/useSendTemplateMessage';
import { type WhatsAppTemplate } from '@/chat/types/WhatsAppTemplate';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormCountryCodeSelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountryCodeSelectInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconBrandMeta, IconX } from '@tabler/icons-react';
import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Tag } from 'twenty-ui/components';
import { Checkmark, H2Title } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledTemplateListContainer = styled.div``;

const StyledHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  align-items: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledFormCountryCodeSelectInput = styled(FormCountryCodeSelectInput)`
  max-width: 50px !important;
`;

export const SendTemplateModal = (): React.ReactNode => {
  const whatsappIntegrations = useFindManyRecords({
    objectNameSingular: 'whatsappIntegration',
    filter: {
      apiType: {
        eq: 'MetaAPI',
      },
    },
    onCompleted: (records) => {
      setSelectedIntegrationId(records[0]?.id ?? '');
    },
  }).records;

  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>();

  const [activeTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID,
  );

  useEffect(() => {
    if (activeTabId) {
      setSelectedIntegrationId(activeTabId);
    }
  }, [activeTabId]);

  useEffect(() => {
    setSelectedTemplateId(null);
  }, [selectedIntegrationId]);

  const { closeModal } = useModal();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    'BR',
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<
    string | number | null
  >(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const { templates, refetch } = useGetWhatsappTemplates(
    selectedIntegrationId ?? '',
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find(
        (template: WhatsAppTemplate) => template.id === selectedTemplateId,
      ) ?? null,
    [templates, selectedTemplateId],
  );

  const selectedCallingCode = useMemo(() => {
    if (!selectedCountryCode) {
      return null;
    }
    try {
      return `+${getCountryCallingCode(selectedCountryCode as CountryCode)}`;
    } catch {
      return null;
    }
  }, [selectedCountryCode]);

  const formattedPhoneNumber = useMemo(
    () =>
      selectedPhoneNumber && selectedCallingCode
        ? `${selectedCallingCode}${selectedPhoneNumber?.toString() ?? ''}`
        : null,
    [selectedPhoneNumber, selectedCallingCode],
  );

  const { sendTemplateMessage } = useSendTemplateMessage();

  const isModalOpen = useRecoilComponentValue(
    isModalOpenedComponentState,
    CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID,
  );

  useEffect(() => {
    refetch();
  }, [isModalOpen, refetch]);

  const handleSendTemplate = useCallback(async () => {
    if (!selectedPhoneNumber || !selectedIntegrationId || !selectedTemplateId) {
      return;
    }
    alert('formattedPhoneNumber: ' + formattedPhoneNumber);
    await sendTemplateMessage({
      selectedPhoneNumber: formattedPhoneNumber,
      selectedIntegrationId,
      selectedTemplateId,
      selectedTemplate,
      onCompleted: () => {
        setSelectedPhoneNumber(null);
        setSelectedTemplateId(null);
      },
    });
  }, [
    selectedIntegrationId,
    selectedPhoneNumber,
    selectedTemplate,
    selectedTemplateId,
    sendTemplateMessage,
    formattedPhoneNumber,
  ]);

  const onClose = useCallback(() => {
    closeModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
  }, [closeModal]);

  const integrationTabs = useMemo(
    () =>
      whatsappIntegrations.map((integration) => ({
        title: integration.name,
        id: integration.id,
        Icon: IconBrandMeta,
      })),
    [whatsappIntegrations],
  );

  return (
    <Modal
      shouldCloseModalOnClickOutsideOrEscape={true}
      modalId={CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID}
    >
      <StyledHeader>
        <H2Title
          title={t`Send template message`}
          description={t`The integrations below have template messaging capabilities. Choose the one you want to use to send a template message from.`}
        />
        <IconButton
          Icon={IconX}
          size="medium"
          variant="tertiary"
          onClick={onClose}
          accent="danger"
        />
      </StyledHeader>
      <TabList
        tabs={integrationTabs}
        componentInstanceId={CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID}
      />
      <StyledTemplateListContainer>
        <TemplateList
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
          templates={templates}
        />
      </StyledTemplateListContainer>
      <StyledFooter>
        <StyledFormCountryCodeSelectInput
          label={t`Recipient's calling code`}
          selectedCountryCode={selectedCountryCode ?? ''}
          onChange={(countryCode) => setSelectedCountryCode(countryCode)}
        />
        <FormNumberFieldInput
          label={t`Recipient's phone number`}
          defaultValue={selectedPhoneNumber ?? ''}
          onChange={(phoneNumber) => setSelectedPhoneNumber(phoneNumber)}
          readonly={false}
        />
        <Button
          disabled={
            !selectedPhoneNumber || !selectedTemplateId || !selectedCountryCode
          }
          onClick={handleSendTemplate}
          title="Send"
        />
      </StyledFooter>
    </Modal>
  );
};

const StyledTemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCard = styled(Card)<{
  isSelected: boolean;
  isPaddingCard?: boolean;
}>`
  outline: ${({ theme, isSelected }) =>
    isSelected ? `2px solid ${theme.color.blue}` : 'none'};
  cursor: pointer;
  &:hover {
    ${({ isPaddingCard, theme, isSelected }) =>
      !isPaddingCard
        ? `outline: ${
            isSelected
              ? `2px solid ${theme.color.blue}`
              : `2px solid ${theme.color.gray30}`
          };`
        : ''}
  }
  ${({ isPaddingCard, theme }) =>
    isPaddingCard &&
    css`
      border: 1px dashed ${theme.border.color.medium};
      background-color: transparent;
      box-shadow: none;
    `}
  max-height: 180px;
`;

const StyledTag = styled(Tag)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledCardContent = styled(CardContent)<{ enabled: boolean }>`
  cursor: ${({ enabled }) => (enabled ? 'pointer' : 'not-allowed')};
  opacity: ${({ enabled }) => (enabled ? 1 : 0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  height: 100%;
`;

const StyledTemplateHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckmark = styled(Checkmark)<{ color: string }>`
  background-color: ${({ color }) => color};
  height: 16px;
  width: 16px;
`;

const TemplateList = memo(
  ({
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
  }: {
    templates: WhatsAppTemplate[];
    selectedTemplateId: string | null;
    setSelectedTemplateId: (templateId: string) => void;
  }) => {
    const { enqueueInfoSnackBar } = useSnackBar();
    return (
      <StyledTemplateList>
        {templates.map((template) => {
          return (
            <StyledCard
              isSelected={selectedTemplateId === template.id}
              key={template.id}
              onClick={() => {
                if (template.status !== 'APPROVED') {
                  enqueueInfoSnackBar({
                    message: t`You cannot select this template because it is not approved.`,
                  });
                  return;
                }
                if (!template.components.every((component) => component.text)) {
                  enqueueInfoSnackBar({
                    message: t`You cannot select this type of template because it is not currently supported.`,
                  });
                  return;
                }
                setSelectedTemplateId(template.id);
              }}
              rounded={true}
            >
              <StyledCardContent
                enabled={
                  template.status === 'APPROVED' &&
                  template.components.every((component) => component.text)
                }
              >
                <StyledTemplateHeader>
                  <StyledCheckmark
                    color={template.status === 'APPROVED' ? 'green' : 'red'}
                  />
                  <H2Title title={template.name} />
                </StyledTemplateHeader>
                <p style={{ margin: 0, marginBottom: 8 }}>
                  {template.components
                    .map((component) => component.text)
                    .join(', ')}
                </p>
              </StyledCardContent>
            </StyledCard>
          );
        })}
        {Array.from({ length: 6 - templates.length }, (_, index) => {
          return (
            <StyledCard
              isSelected={false}
              key={`empty-${index}`}
              rounded={true}
              isPaddingCard={true}
            >
              <StyledCardContent enabled={false}>
                <StyledTemplateHeader>
                  <H2Title title="" />
                </StyledTemplateHeader>
              </StyledCardContent>
            </StyledCard>
          );
        })}
      </StyledTemplateList>
    );
  },
);
