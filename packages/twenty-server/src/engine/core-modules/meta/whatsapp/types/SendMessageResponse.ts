import { SendWhatsAppMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { IMessage } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';

//https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#response-syntax
export type SendMessageResponse = Partial<SendWhatsAppMessageInput> & {
  messages: IMessage[];
};
