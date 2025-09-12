import { Node } from '@xyflow/react';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import { NodeHandler } from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { SendMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';

export class TextInputHandler implements NodeHandler {
  constructor(
    private sendMessage: (
      input: SendMessageInput,
      workspaceId: string,
    ) => Promise<void>,
    private integrationId: string,
    private sendTo: string,
    private personId: string,
    private chatbotName: string,
    private workspaceId: string,
  ) {}

  async process(node: Node): Promise<string | null> {
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();

      await this.sendMessage(
        {
          integrationId: this.integrationId,
          to: this.sendTo,
          type: MessageTypes.TEXT,
          message: formattedText,
          from: this.chatbotName,
          personId: this.personId,
        },
        this.workspaceId,
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
