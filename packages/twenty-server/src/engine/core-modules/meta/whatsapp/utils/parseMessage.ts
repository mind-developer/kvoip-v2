import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SendMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';

export function parseFields(input: SendMessageInput) {
  const fields: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: input.to,
    type: input.type,
  };

  const commonFields = {
    link: input.fileId,
    caption: input.message || '',
  };

  switch (input.type) {
    case 'text':
      fields.text = {
        preview_url: true,
        body: input.message || '',
      };
      break;
    case 'audio':
      fields.audio = {
        link: input.fileId,
      };
      break;
    case 'document':
      fields.document = commonFields;
      break;
    case 'image':
      fields.image = commonFields;
      break;
    case 'video':
      fields.video = commonFields;
      break;
    default:
      throw new InternalServerError('Invalid message type');
  }
  return fields;
}
