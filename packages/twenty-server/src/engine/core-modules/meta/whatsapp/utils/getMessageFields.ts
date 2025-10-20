import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { ChatMessageType, ClientChatMessage } from 'twenty-shared/types';

export async function getMessageFields(
  input: Omit<ClientChatMessage, 'providerMessageId'>,
  clientChat: ClientChatWorkspaceEntity,
) {
  const fields: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientChat.providerContactId,
    type: input.type,
  };

  const commonFields = {
    link: input.attachmentUrl,
    caption: input.textBody || '',
  };

  switch (input.type) {
    case ChatMessageType.TEXT:
      fields.text = {
        preview_url: true,
        body: input.textBody || '',
      };
      break;
    case ChatMessageType.AUDIO:
      fields.audio = {
        link: input.attachmentUrl,
      };
      break;
    case ChatMessageType.DOCUMENT:
      fields.document = commonFields;
      break;
    case ChatMessageType.IMAGE:
      fields.image = commonFields;
      break;
    case ChatMessageType.VIDEO:
      fields.video = commonFields;
      break;
    default:
      throw new InternalServerError('Invalid message type: ' + input.type);
  }
  fields.type = fields.type.toLowerCase();
  return fields;
}
