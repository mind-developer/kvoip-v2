import { Injectable } from '@nestjs/common';
import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';

@Injectable()
export class ConditionalInputHandler implements NodeHandler {
  askedNodes: Set<string>;
  private compare(
    actual: string,
    expected: string,
    comparison: string,
  ): boolean {
    switch (comparison) {
      case '==':
        return actual === expected;
      case '!==':
        return actual !== expected;
      case 'contains':
        return actual.includes(expected);
      default:
        return false;
    }
  }

  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendChatMessageQueue: MessageQueueService,
  ) {
    //this will probably cause issues
    this.askedNodes = new Set<string>();
  }

  async process(params: ProcessParams): Promise<string | null> {
    const {
      node,
      providerIntegrationId,
      provider,
      clientChat,
      chatbotName,
      workspaceId,
      sectors,
      context,
    } = params;
    const logic = node.data?.logic as NewConditionalState | undefined;

    if (!logic || !logic.logicNodeData) return null;

    const nodeId = node.id;

    const input = context.incomingMessage.toLowerCase().trim();
    const prompt = typeof node.data?.text === 'string' ? node.data.text : '';

    if (!this.askedNodes.has(nodeId)) {
      this.askedNodes.add(nodeId);
      if (prompt) {
        const message: Omit<ClientChatMessage, 'providerMessageId'> = {
          type: ChatMessageType.TEXT,
          textBody: prompt,
          clientChatId: clientChat.id,
          to: clientChat.providerContactId,
          from: chatbotName,
          fromType: ChatMessageFromType.CHATBOT,
          toType: ChatMessageToType.PERSON,
          provider: provider,
          caption: null,
          deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
          edited: false,
          attachmentUrl: null,
          event: null,
        };
        console.log('sending', message.textBody);
        this.sendChatMessageQueue.add<SendChatMessageQueueData>(
          SendChatMessageJob.name,
          {
            clientChatMessage: message,
            providerIntegrationId,
            workspaceId,
          },
        );
      }

      const optionsList = logic.logicNodeData
        .map((d) => {
          if (d.recordType === 'text') {
            return `${d.option} - ${d.message?.trim() || ''}`;
          }

          if (d.recordType === 'sectors') {
            const sector = sectors.find((s) => s.id === d.sectorId);
            const name = sector?.name ?? '';

            return `${d.option} - ${name}`;
          }

          return '';
        })
        .join('\n');

      if (optionsList) {
        const message: Omit<ClientChatMessage, 'providerMessageId'> = {
          type: ChatMessageType.TEXT,
          textBody: optionsList,
          clientChatId: clientChat.id,
          to: clientChat.providerContactId,
          from: chatbotName,
          fromType: ChatMessageFromType.CHATBOT,
          toType: ChatMessageToType.PERSON,
          provider: provider,
          caption: null,
          deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
          edited: false,
          attachmentUrl: null,
          event: null,
        };
        this.sendChatMessageQueue.add<SendChatMessageQueueData>(
          SendChatMessageJob.name,
          {
            clientChatMessage: message,
            providerIntegrationId,
            workspaceId,
          },
        );
      }

      return null;
    }

    for (const d of logic.logicNodeData) {
      const sector = sectors.find((s) => s.id === d.sectorId);
      const sectorName = sector?.name.toLowerCase() ?? '';

      const option = d.option.toLowerCase();
      const comparison = d.comparison;
      const condition = d.conditionValue;

      const matchOption = this.compare(input, option, comparison);
      const fallbackMessage = d.message?.toLowerCase().trim() ?? '';
      const matchSector = sectorName
        ? this.compare(input, sectorName, comparison)
        : this.compare(input, fallbackMessage, comparison);

      const matched =
        condition === '||'
          ? matchOption || matchSector
          : matchOption && matchSector;

      if (matched) {
        this.askedNodes.delete(nodeId); // limpa para próxima vez que cair aqui
        return d.outgoingNodeId ?? null;
      }
    }

    return null;
  }
}
