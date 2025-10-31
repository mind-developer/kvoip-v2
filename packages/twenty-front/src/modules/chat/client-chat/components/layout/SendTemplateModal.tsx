import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useGetWhatsappTemplates } from '@/chat/client-chat/hooks/useGetWhatsappTemplates';
import { useSendTemplateMessage } from '@/chat/client-chat/hooks/useSendTemplateMessage';
import { type WhatsAppTemplate } from '@/chat/types/WhatsAppTemplate';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconBrandMeta, IconX } from '@tabler/icons-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Tag } from 'twenty-ui/components';
import { H2Title } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledTemplateListContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

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

const StyledCountrySelect = styled(CountrySelect)`
  max-width: 50px;
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
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(
    'Brazil',
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

  const { sendTemplateMessage } = useSendTemplateMessage(
    selectedPhoneNumber?.toString() ?? null,
    selectedIntegrationId,
    selectedTemplateId,
    selectedTemplate,
  );

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
    await sendTemplateMessage({
      selectedPhoneNumber: selectedPhoneNumber.toString(),
      selectedIntegrationId,
      selectedTemplateId,
      selectedTemplate,
      onSuccess: () => {
        setSelectedPhoneNumber(null);
        setSelectedIntegrationId('');
        setSelectedTemplateId(null);
      },
    });
  }, [
    selectedIntegrationId,
    selectedPhoneNumber,
    selectedTemplate,
    selectedTemplateId,
    sendTemplateMessage,
    setSelectedIntegrationId,
    setSelectedPhoneNumber,
    setSelectedTemplateId,
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
        <StyledCountrySelect
          label="Country"
          selectedCountryName={selectedCountryName ?? 'BR'}
          onChange={(countryName) => setSelectedCountryName(countryName)}
        />
        <FormNumberFieldInput
          label="Phone Number"
          defaultValue={selectedPhoneNumber ?? ''}
          onChange={(phoneNumber) => setSelectedPhoneNumber(phoneNumber)}
          readonly={false}
        />
        <Button
          disabled={
            !selectedPhoneNumber || !selectedTemplateId || !selectedCountryName
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

const StyledCard = styled(Card)<{ isSelected: boolean }>`
  outline: ${({ theme, isSelected }) =>
    isSelected ? `2px solid ${theme.color.blue}` : 'none'};
  cursor: pointer;
  &:hover {
    outline: ${({ theme, isSelected }) =>
      isSelected
        ? `2px solid ${theme.color.blue}`
        : `2px solid ${theme.color.gray30}`};
  }
`;

const StyledTag = styled(Tag)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
    const items = useMemo(
      () =>
        templates.map((template) => (
          <StyledCard
            isSelected={selectedTemplateId === template.id}
            key={template.id}
            onClick={() => setSelectedTemplateId(template.id)}
          >
            <CardContent>
              <StyledTag
                variant="outline"
                color={template.status === 'APPROVED' ? 'green' : 'red'}
                text={template.status}
              />
              <H2Title title={template.name} />
              <p>
                {template.components
                  .map((component) => component.text)
                  .join(', ')}
              </p>
            </CardContent>
          </StyledCard>
        )),
      [templates, selectedTemplateId, setSelectedTemplateId],
    );

    return <StyledTemplateList>{items}</StyledTemplateList>;
  },
);
