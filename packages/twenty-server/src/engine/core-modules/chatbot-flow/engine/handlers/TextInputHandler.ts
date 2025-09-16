import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { SendWhatsAppMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';

@Injectable()
export class TextInputHandler implements NodeHandler {
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}

  async process(params: ProcessParams): Promise<string | null> {
    const {
      node,
      integrationId,
      sendTo,
      chatbotName,
      personId,
      workspaceId,
      onMessage,
    } = params;
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();
      const message: SendWhatsAppMessageInput = {
        integrationId: integrationId,
        to: sendTo,
        type: MessageTypes.TEXT,
        message: formattedText,
        from: chatbotName,
        fromMe: true,
        personId: personId,
      };
      onMessage(
        await this.chatMessageManagerService.sendWhatsAppMessage(
          message,
          workspaceId,
        ),
        message,
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
