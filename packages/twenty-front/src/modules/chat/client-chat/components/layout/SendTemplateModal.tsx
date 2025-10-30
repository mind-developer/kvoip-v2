import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useGetWhatsappTemplates } from '@/chat/client-chat/hooks/useGetWhatsappTemplates';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { type WhatsAppTemplate } from '@/chat/types/WhatsAppTemplate';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Person } from '@/people/types/Person';
import { TextInput } from '@/ui/input/components/TextInput';
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
import {
  ChatIntegrationProvider,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatStatus,
} from 'twenty-shared/types';
import { Tag } from 'twenty-ui/components';
import { H2Title } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';
import { v4 } from 'uuid';

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
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
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
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
    null,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const { sendClientChatMessage } = useSendClientChatMessage();
  const { createOneRecord: createOnePerson } = useCreateOneRecord<Person>({
    objectNameSingular: 'person',
  });
  const { deleteOneRecord: deleteOnePerson } = useDeleteOneRecord({
    objectNameSingular: 'person',
  });
  const { deleteOneRecord: deleteOneClientChat } = useDeleteOneRecord({
    objectNameSingular: 'clientChat',
  });
  const { createOneRecord: createOneClientChat } = useCreateOneRecord({
    objectNameSingular: 'clientChat',
  });

  const { templates, refetch } = useGetWhatsappTemplates(
    selectedIntegrationId ?? '',
  );

  const isModalOpen = useRecoilComponentValue(
    isModalOpenedComponentState,
    CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID,
  );

  useEffect(() => {
    if (isModalOpen) {
      refetch();
    }
  }, [isModalOpen, refetch]);

  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const agentId = workspaceMemberWithAgent?.agent?.id;

  const selectedTemplate = useMemo(
    () =>
      templates.find(
        (template: WhatsAppTemplate) => template.id === selectedTemplateId,
      ) ?? null,
    [templates, selectedTemplateId],
  );

  const handleSendTemplate = useCallback(() => {
    let clientChatId: string = v4();
    let personId: string = v4();
    createOnePerson({
      id: personId,
      name: {
        firstName: selectedPhoneNumber + '(Chat)',
        lastName: '',
      },
      phones: {
        primaryPhoneNumber: selectedPhoneNumber ?? '',
        primaryPhoneCallingCode: '',
        primaryPhoneCountryCode: 'BR',
        additionalPhones: [],
      },
    })
      .then((person) => {
        personId = person.id;
        createOneClientChat({
          id: clientChatId,
          personId: person.id,
          //todo: get provider from integration
          providerContactId: selectedPhoneNumber ?? '',
          whatsappIntegrationId: selectedIntegrationId ?? '',
          lastMessageDate: new Date(),
          lastMessageType: ChatMessageType.TEMPLATE,
          lastMessagePreview: null,
          unreadMessagesCount: 0,
          status: ClientChatStatus.ASSIGNED,
          agentId,
        })
          .then((clientChat) => {
            clientChatId = clientChat.id;
            if (!agentId) {
              return;
            }
            sendClientChatMessage({
              clientChatId: clientChat.id,
              fromType: ChatMessageFromType.AGENT,
              from: agentId ?? '',
              to: personId ?? '',
              provider: ChatIntegrationProvider.WHATSAPP,
              toType: ChatMessageToType.PERSON,
              type: ChatMessageType.TEMPLATE,
              providerIntegrationId: selectedIntegrationId ?? '',
              templateId: selectedTemplateId ?? '',
              templateLanguage: selectedTemplate?.language ?? null,
              templateName: selectedTemplate?.name ?? null,
            });
            closeModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
          })
          .catch((error) => {
            console.error(error);
            deleteOnePerson(personId);
            deleteOneClientChat(clientChatId);
          });
      })
      .catch((error) => {
        console.error(error);
        deleteOnePerson(personId);
        deleteOneClientChat(clientChatId);
      })
      .finally(() => {
        setSelectedPhoneNumber(null);
        setSelectedIntegrationId('');
        setSelectedTemplateId(null);
      });
  }, [
    agentId,
    closeModal,
    createOneClientChat,
    createOnePerson,
    deleteOneClientChat,
    deleteOnePerson,
    selectedIntegrationId,
    selectedPhoneNumber,
    selectedTemplate,
    selectedTemplateId,
    sendClientChatMessage,
    setSelectedIntegrationId,
    setSelectedPhoneNumber,
    setSelectedTemplateId,
  ]);

  const onClose = useCallback(() => {
    closeModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
    setSelectedPhoneNumber(null);
    setSelectedIntegrationId('');
    setSelectedTemplateId(null);
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
        <TextInput
          fullWidth
          placeholder="Phone number"
          type="tel"
          value={selectedPhoneNumber ?? ''}
          onChange={(text) => setSelectedPhoneNumber(text)}
        />
        <Button
          disabled={!selectedPhoneNumber || !selectedTemplateId}
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
