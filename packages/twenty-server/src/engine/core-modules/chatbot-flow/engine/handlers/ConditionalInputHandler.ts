import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-flow/types/LogicNodeDataType';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';

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
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {
    this.askedNodes = new Set<string>();
  }

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
    const logic = node.data?.logic as NewConditionalState | undefined;

    if (!logic || !logic.logicNodeData) return null;

    const nodeId = node.id;

    const input = context.incomingMessage.toLowerCase().trim();
    const prompt = typeof node.data?.text === 'string' ? node.data.text : '';

    if (!this.askedNodes.has(nodeId)) {
      this.askedNodes.add(nodeId);

      if (prompt) {
        const message = {
          type: MessageTypes.TEXT,
          message: prompt,
          integrationId,
          to: sendTo,
          from: chatbotName,
          fromMe: true,
          personId,
        };
        onMessage(
          await this.chatMessageManagerService.sendWhatsAppMessage(
            message,
            workspaceId,
          ),
          message,
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
        const message = {
          type: MessageTypes.TEXT,
          message: optionsList,
          integrationId,
          to: sendTo,
          from: chatbotName,
          fromMe: true,
          personId,
        };
        onMessage(
          await this.chatMessageManagerService.sendWhatsAppMessage(
            message,
            workspaceId,
          ),
          message,
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
