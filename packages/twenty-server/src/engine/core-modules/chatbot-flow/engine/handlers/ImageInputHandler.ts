import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';

@Injectable()
export class ImageInputHandler implements NodeHandler {
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
    const image =
      typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (image) {
      const message = {
        integrationId,
        to: sendTo,
        type: MessageTypes.IMAGE,
        fileId: image,
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
