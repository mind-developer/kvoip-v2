/* @kvoip-woulz proprietary */
import { useCallback } from 'react';

import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useCurrentWorkspaceMemberWithAgent } from '@/chat/client-chat/hooks/useCurrentWorkspaceMemberWithAgent';
import { useSendClientChatMessage } from '@/chat/client-chat/hooks/useSendClientChatMessage';
import { WhatsAppTemplate } from '@/chat/types/WhatsAppTemplate';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { Person } from '@/people/types/Person';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  ChatIntegrationProvider,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
} from 'twenty-shared/types';
import { normalizePhoneNumber } from 'twenty-shared/utils';

type SendTemplateMessageParams = {
  selectedPhoneNumber: string | number | null;
  selectedIntegrationId: string;
  selectedTemplateId: string;
  selectedTemplate: WhatsAppTemplate;
  onCompleted?: () => void;
};

export const useSendTemplateMessage = () => {
  const { closeModal } = useModal();
  const currentWorkspaceMemberWithAgent = useCurrentWorkspaceMemberWithAgent();
  const { sendClientChatMessage } = useSendClientChatMessage();
  const { enqueueErrorSnackBar } = useSnackBar();
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'clientChat',
  });

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: 'clientChat',
  });

  const { createOneRecord: createPersonRecord } = useCreateOneRecord<Person>({
    objectNameSingular: 'person',
  });
  const { createOneRecord: createClientChatRecord } = useCreateOneRecord({
    objectNameSingular: 'clientChat',
  });

  const sendTemplateMessage = useCallback(
    async ({
      selectedPhoneNumber,
      selectedIntegrationId,
      selectedTemplateId,
      selectedTemplate,
      onCompleted,
    }: SendTemplateMessageParams) => {
      if (!selectedPhoneNumber || !selectedIntegrationId || !selectedTemplate) {
        return;
      }
      const phoneNumberString = selectedPhoneNumber.toString();
      const normalizedPhone = normalizePhoneNumber(phoneNumberString);
      const normalizedProviderContactId = (
        normalizedPhone.primaryPhoneCallingCode +
        normalizedPhone.primaryPhoneNumber
      ).replace(/\+/g, '');

      const filter = {
        and: [
          {
            providerContactId: {
              eq: normalizedProviderContactId,
            },
          },
          {
            whatsappIntegrationId: {
              eq: selectedIntegrationId,
            },
          },
        ],
      };

      const { data } =
        await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
          query: findManyRecordsQuery,
          variables: {
            filter,
          },
          fetchPolicy: 'cache-first',
        });

      const clientChats = getRecordsFromRecordConnection({
        recordConnection: data?.[objectMetadataItem.namePlural] ?? {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '',
            endCursor: '',
          },
          totalCount: 0,
        },
      });

      let clientChat = clientChats.find(
        (chat) =>
          chat.providerContactId === normalizedProviderContactId &&
          chat.whatsappIntegrationId === selectedIntegrationId,
      );

      if (!clientChat) {
        const person = await createPersonRecord({
          name: {
            firstName:
              normalizedPhone.primaryPhoneCountryCode +
              ' ' +
              normalizedPhone.primaryPhoneNumber,
            lastName: '',
          },
          phones: {
            primaryPhoneNumber: normalizedPhone.primaryPhoneNumber,
            primaryPhoneCallingCode: normalizedPhone.primaryPhoneCallingCode,
            primaryPhoneCountryCode: normalizedPhone.primaryPhoneCountryCode,
            additionalPhones: [],
          },
        } as Partial<Person> & { phones: unknown });

        if (!person) {
          enqueueErrorSnackBar({
            message: 'Failed to create person',
          });
          return;
        }

        clientChat = await createClientChatRecord({
          providerContactId: normalizedProviderContactId,
          whatsappIntegrationId: selectedIntegrationId,
          agentId: currentWorkspaceMemberWithAgent?.agent?.id ?? '',
          sectorId: currentWorkspaceMemberWithAgent?.agent?.sectorId ?? '',
          status: 'ASSIGNED',
          personId: person.id,
          lastMessageType: ChatMessageType.TEMPLATE,
          lastMessageDate: new Date(),
          lastMessagePreview: `Template: ${selectedTemplate.name}`,
        });

        if (!clientChat) {
          enqueueErrorSnackBar({
            message: 'Failed to create client chat. Please try again.',
          });
          return;
        }
      }

      sendClientChatMessage({
        clientChatId: clientChat.id,
        fromType: ChatMessageFromType.AGENT,
        from: currentWorkspaceMemberWithAgent?.agent?.id ?? '',
        to: clientChat.personId ?? '',
        provider: ChatIntegrationProvider.WHATSAPP,
        toType: ChatMessageToType.PERSON,
        type: ChatMessageType.TEMPLATE,
        providerIntegrationId: selectedIntegrationId,
        templateId: selectedTemplateId,
        templateLanguage: selectedTemplate.language ?? null,
        templateName: selectedTemplate.name ?? null,
      });

      closeModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
      onCompleted?.();
    },
    [
      apolloCoreClient,
      closeModal,
      createPersonRecord,
      createClientChatRecord,
      currentWorkspaceMemberWithAgent,
      enqueueErrorSnackBar,
      findManyRecordsQuery,
      objectMetadataItem.namePlural,
      sendClientChatMessage,
    ],
  );

  return { sendTemplateMessage };
};
