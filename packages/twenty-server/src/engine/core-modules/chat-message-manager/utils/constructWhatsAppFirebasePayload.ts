import { ChatIntegrationSaveMessageInput } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import {
  IMessage,
  WhatsAppDocument,
} from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';

export function constructWhatsAppFirebasePayload(
  input: ChatIntegrationSaveMessageInput['whatsApp'],
  personId: string,
  fullName: string,
  ppUrl: string | null,
  email: string | null,
  messageId: string,
): Omit<
  WhatsAppDocument,
  'timeline' | 'unreadMessages' | 'isVisible' | 'personId'
> & { personId: string } {
  const lastMessage: IMessage = {
    createdAt: new Date(),
    from: input.from,
    fromMe: input.fromMe,
    message: input.fileId ? input.fileId : input.message || '',
    type: input.type,
    id: messageId,
  };

  return {
    integrationId: input.integrationId,
    client: {
      name: fullName,
      ppUrl: ppUrl ?? null,
      phone: input.to,
      email: email ?? null,
    },
    personId: personId,
    messages: [
      {
        ...lastMessage,
      },
    ],
    status: statusEnum.Waiting,
    lastMessage,
  };
}
