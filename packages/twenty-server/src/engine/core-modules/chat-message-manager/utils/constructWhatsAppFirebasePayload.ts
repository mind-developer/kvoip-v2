import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { SendWhatsAppMessageInput } from '../../meta/whatsapp/dtos/send-whatsapp-message.input';
export function constructWhatsAppFirebasePayload(
  input: SendWhatsAppMessageInput,
  messageId: string,
): Omit<WhatsAppDocument, 'timeline' | 'unreadMessages' | 'isVisible'> {
  const lastMessage = {
    createdAt: new Date(),
    from: input.from,
    fromMe: input.fromMe,
    message: input.fileId ? input.fileId : input.message || '',
    type: input.type,
    id: messageId,
    status: 'pending',
  };

  return {
    integrationId: input.integrationId,
    client: {
      phone: input.to,
    },
    personId: input.personId,
    messages: [
      {
        ...lastMessage,
      },
    ],
    status: statusEnum.Waiting,
    lastMessage,
  };
}
