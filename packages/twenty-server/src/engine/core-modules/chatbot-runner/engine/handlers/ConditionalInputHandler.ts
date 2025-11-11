import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ClientChatMessageNoBaseFields } from 'src/engine/core-modules/chat-message-manager/types/ClientChatMessageNoBaseFields';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
} from 'twenty-shared/types';

@Injectable()
export class ConditionalInputHandler implements NodeHandler {
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

  constructor(private chatMessageManagerService: ChatMessageManagerService) {}

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
      askedNodes,
    } = params;
    const logic = node.data?.logic as NewConditionalState | undefined;

    if (!logic || !logic.logicNodeData) {
      return null;
    }

    // Usa o estado passado pelo executor, ou cria um novo se não fornecido (fallback)
    const askedNodesSet = askedNodes || new Set<string>();
    const nodeId = node.id;

    const input = context.incomingMessage.toLowerCase().trim();
    const prompt = typeof node.data?.text === 'string' ? node.data.text : '';

    if (!askedNodesSet.has(nodeId)) {
      askedNodesSet.add(nodeId);
      if (prompt) {
        const message: Omit<
          ClientChatMessageNoBaseFields,
          'providerMessageId'
        > = {
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
          reactions: null,
          repliesTo: null,
          templateId: null,
          templateLanguage: null,
          templateName: null,
        };
        await this.chatMessageManagerService.sendMessage(
          message,
          workspaceId,
          providerIntegrationId,
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
        const message: Omit<
          ClientChatMessageNoBaseFields,
          'providerMessageId'
        > = {
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
          reactions: null,
          repliesTo: null,
          templateId: null,
          templateLanguage: null,
          templateName: null,
        };
        await this.chatMessageManagerService.sendMessage(
          message,
          workspaceId,
          providerIntegrationId,
        );
      }

      return null;
    }

    for (const d of logic.logicNodeData) {
      const sector = sectors.find((s) => s.id === d.sectorId);
      const sectorName = sector?.name.toLowerCase().trim() ?? '';

      const option = d.option.toLowerCase().trim();
      const comparison = d.comparison || '==';
      const condition = d.conditionValue;

      const matchOption = this.compare(input, option, comparison);
      const fallbackMessage = d.message?.toLowerCase().trim() ?? '';
      const matchSector = sectorName
        ? this.compare(input, sectorName, comparison)
        : fallbackMessage
          ? this.compare(input, fallbackMessage, comparison)
          : false;

      const matched =
        condition === '||'
          ? matchOption || matchSector
          : matchOption && matchSector;

      if (matched) {
        askedNodesSet.delete(nodeId);
        const conditionOutgoingNodeId =
          d.outgoingNodeId && d.outgoingNodeId.trim() !== ''
            ? d.outgoingNodeId
            : null;
        const nodeOutgoingNodeId =
          typeof node.data?.outgoingNodeId === 'string'
            ? node.data.outgoingNodeId
            : null;
        const outgoingNodeId = conditionOutgoingNodeId ?? nodeOutgoingNodeId;
        return outgoingNodeId;
      }
    }

    return null;
  }
}
