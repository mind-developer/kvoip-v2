import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';

@Injectable()
export class FileInputHandler implements NodeHandler {
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
      sectors,
      onMessage,
      context,
    } = params;

    const file =
      typeof node.data?.fileUrl === 'string' ? node.data.fileUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (file) {
      const message = {
        integrationId: integrationId,
        to: sendTo,
        type: MessageTypes.DOCUMENT,
        fileId: file,
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
