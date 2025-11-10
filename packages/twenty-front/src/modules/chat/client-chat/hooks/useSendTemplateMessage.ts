/* @kvoip-woulz proprietary */
import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { type WhatsAppTemplate } from '@/chat/types/WhatsAppTemplate';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { type Person } from '@/people/types/Person';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  ChatIntegrationProvider,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatStatus,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

type UseSendTemplateMessageParams = {
  selectedPhoneNumber: string | null;
  selectedIntegrationId: string | undefined;
  selectedTemplateId: string | null;
  selectedTemplate: WhatsAppTemplate | null;
  onSuccess?: () => void;
};

export const useSendTemplateMessage = (
  selectedPhoneNumber: string | null,
  selectedIntegrationId: string | undefined,
  selectedTemplateId: string | null,
  selectedTemplate: WhatsAppTemplate | null,
) => {
  const { closeModal } = useModal();
  const workspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const agentId = workspaceMemberWithAgent?.agent?.id;
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
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'clientChat',
  });
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: 'clientChat',
  });

  const sendTemplateMessage = async ({
    selectedPhoneNumber,
    selectedIntegrationId,
    selectedTemplateId,
    selectedTemplate,
    onSuccess,
  }: UseSendTemplateMessageParams) => {
    if (!selectedPhoneNumber || !selectedTemplateId || !selectedIntegrationId) {
      return;
    }

    // Check if a chat already exists with the same providerContactId
    const queryResult = await apolloCoreClient.query({
      query: findManyRecordsQuery,
      variables: {
        filter: {
          providerContactId: {
            eq: selectedPhoneNumber,
          },
          whatsappIntegrationId: {
            eq: selectedIntegrationId,
          },
        },
        limit: 1,
      },
      fetchPolicy: 'cache-first',
    });

    const existingChats = getRecordsFromRecordConnection({
      recordConnection: queryResult.data[objectMetadataItem.namePlural],
    });

    if (existingChats.length > 0) {
      sendClientChatMessage({
        clientChatId: existingChats[0].id,
        fromType: ChatMessageFromType.AGENT,
        from: agentId ?? '',
        to: existingChats[0].personId ?? '',
        provider: ChatIntegrationProvider.WHATSAPP,
        toType: ChatMessageToType.PERSON,
        type: ChatMessageType.TEMPLATE,
        providerIntegrationId: selectedIntegrationId ?? '',
        templateId: selectedTemplateId ?? '',
        templateLanguage: selectedTemplate?.language ?? null,
        templateName: selectedTemplate?.name ?? null,
      });
      closeModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
      onSuccess?.();
      return;
    }

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
            onSuccess?.();
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
      });
  };

  return { sendTemplateMessage };
};
