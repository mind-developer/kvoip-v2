import { Injectable } from '@nestjs/common';
import { Node } from '@xyflow/react';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-flow/types/LogicNodeDataType';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import { NodeHandler } from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { MessageManagerService } from 'src/engine/core-modules/meta/whatsapp/message-manager/message-manager.service';

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

  constructor(private readonly messageManagerService: MessageManagerService) {
    this.askedNodes = new Set<string>();
  }

  async process(
    integrationId: string,
    workspaceId: string,
    sendTo: string,
    personId: string,
    chatbotName: string,
    sectors: { id: string; name: string }[],
    node: Node,
    context: { incomingMessage: string },
  ): Promise<string | null> {
    const logic = node.data?.logic as NewConditionalState | undefined;

    if (!logic || !logic.logicNodeData) return null;

    const nodeId = node.id;

    const input = context.incomingMessage.toLowerCase().trim();
    const prompt = typeof node.data?.text === 'string' ? node.data.text : '';

    if (!this.askedNodes.has(nodeId)) {
      this.askedNodes.add(nodeId);

      if (prompt) {
        await this.messageManagerService.sendWhatsAppMessage(
          {
            type: MessageTypes.TEXT,
            message: prompt,
            integrationId: integrationId,
            to: sendTo,
            from: chatbotName,
            personId: personId,
          },
          workspaceId,
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
        await this.messageManagerService.sendWhatsAppMessage(
          {
            type: MessageTypes.TEXT,
            message: optionsList,
            integrationId: integrationId,
            to: sendTo,
            from: chatbotName,
            personId: personId,
          },
          workspaceId,
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
