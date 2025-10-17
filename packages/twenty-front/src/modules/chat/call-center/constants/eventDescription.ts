import { t } from '@lingui/core/macro';
import { ClientChatMessageEvent } from 'twenty-shared/types';

export const EVENT_DESCRIPTION = {
  [ClientChatMessageEvent.START]: t`Service started`,
  [ClientChatMessageEvent.END]: t`Service finished`,
  [ClientChatMessageEvent.TRANSFER_TO_AGENT]: t`Service transferred to agent`,
  [ClientChatMessageEvent.TRANSFER_TO_SECTOR]: t`Service transferred to sector`,
  [ClientChatMessageEvent.ONHOLD]: t`Service placed on hold`,
  [ClientChatMessageEvent.CHATBOT_START]: t`A Chatbot started the service`,
  [ClientChatMessageEvent.CHATBOT_END]: t`A Chatbot finished the service`,
};
