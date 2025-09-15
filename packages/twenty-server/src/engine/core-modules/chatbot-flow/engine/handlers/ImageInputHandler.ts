import { Injectable } from '@nestjs/common';
import { Node } from '@xyflow/react';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import { NodeHandler } from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { MessageManagerService } from 'src/engine/core-modules/meta/whatsapp/message-manager/message-manager.service';

@Injectable()
export class ImageInputHandler implements NodeHandler {
  constructor(private readonly messageManagerService: MessageManagerService) {}

  async process(
    integrationId: string,
    workspaceId: string,
    sendTo: string,
    personId: string,
    chatbotName: string,
    sectors: { id: string; name: string }[],
    node: Node,
  ): Promise<string | null> {
    const image =
      typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (image) {
      await this.messageManagerService.sendWhatsAppMessage(
        {
          integrationId: integrationId,
          to: sendTo,
          type: MessageTypes.IMAGE,
          fileId: image,
          from: chatbotName,
          personId: personId,
        },
        workspaceId,
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
