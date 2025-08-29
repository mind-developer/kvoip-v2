//https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#response-syntax
export type SendMessageResponse = {
  messaging_product?: 'whatsapp' | 'whatsapp_business';
  contacts?: Contact[];
  messages: Message[];
};

type Contact = {
  input?: string;
  wa_id?: string;
};

type Message = {
  id: string;
  message_status?: string;
};
