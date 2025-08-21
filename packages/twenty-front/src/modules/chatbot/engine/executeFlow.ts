/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
import { Node } from '@xyflow/react';

import { SendMessageType } from '@/chat/call-center/hooks/useSendWhatsappMessages';
import { NodeType } from '@/chatbot/constants/NodeTypes';
import { ConditionalInputHandler as ConditionalInputHandler } from '@/chatbot/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from '@/chatbot/engine/handlers/FileInputHandler';
import { ImageInputHandler } from '@/chatbot/engine/handlers/ImageInputHandler';
import { NewConditionalState } from '@/chatbot/types/LogicNodeDataType';
import { NodeHandler } from './handlers/NodeHandler';
import { TextInputHandler } from './handlers/TextInputHandler';

export class ExecuteFlow {
  private nodes: Node[];
  private currentNodeId?: string;
  private incomingMessage = '';
  private handlers: Record<string, NodeHandler>;
  private onFinish?: (finalNode: Node, chosenInput?: string) => void;
  private chosenInput?: string;

  constructor(
    chatbotFlow: ChatbotFlowInput,
    sendMessage: SendMessageType,
    integrationId: string,
    recipient: string,
    chatbotName: string,
    sectors: { id: string; name: string }[],
    onFinish?: (finalNode: Node, chosenInput?: string) => void,
  ) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.findStartNode()?.id;

    this.handlers = {
      [NodeType.TEXT]: new TextInputHandler(
        sendMessage,
        integrationId,
        recipient,
        chatbotName,
      ),
      [NodeType.CONDITION]: new ConditionalInputHandler(
        sendMessage,
        integrationId,
        recipient,
        chatbotName,
        sectors,
      ),
      [NodeType.IMAGE]: new ImageInputHandler(
        sendMessage,
        integrationId,
        recipient,
        chatbotName,
      ),
      [NodeType.FILE]: new FileInputHandler(
        sendMessage,
        integrationId,
        recipient,
        chatbotName,
      ),
    };

    this.onFinish = onFinish;
  }

  private findStartNode(): Node | undefined {
    return this.nodes.find((node) => node.data?.nodeStart);
  }

  private findNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  private getNextNodeId(currentNode: Node): string | null {
    if (currentNode.data?.outgoingNodeId) {
      return currentNode.data.outgoingNodeId as string;
    }
    return null;
  }

  public setIncomingMessage(input: string) {
    this.incomingMessage = input;
  }

  public async runFlow(): Promise<void> {
    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler = this.handlers[currentNode.type];

      if (!handler) break;

      const nextNodeId = await handler.process(currentNode, {
        incomingMessage: this.incomingMessage,
      });

      if (currentNode.type === NodeType.CONDITION) {
        const logic = currentNode.data?.logic as NewConditionalState;

        if (logic?.logicNodeData && nextNodeId) {
          const matchedCondition = logic.logicNodeData.find(
            (condition) => condition.outgoingNodeId === nextNodeId,
          );

          if (matchedCondition) {
            this.chosenInput = matchedCondition.sectorId;
          }
        }

        if (!nextNodeId) {
          return;
        }
      }

      if (!nextNodeId) {
        if (
          this.onFinish &&
          ['text', 'image', 'file'].includes(currentNode.type)
        ) {
          this.onFinish(currentNode, this.chosenInput);
        }
        break;
      }

      this.currentNodeId = nextNodeId;
    }
  }

  public async runFlowWithLog(): Promise<void> {
    const trace: string[] = [];

    console.log('User input: ', this.incomingMessage);

    while (this.currentNodeId) {
      const currentNode = this.findNodeById(this.currentNodeId);

      if (!currentNode || typeof currentNode.type !== 'string') {
        trace.push(`Invalid node or undefined type: ${this.currentNodeId}`);
        break;
      }

      trace.push(
        `Processing node ${currentNode.id} (type: ${currentNode.type})`,
      );

      const handler = this.handlers[currentNode.type];

      console.log('handler: ', handler);

      if (!handler) {
        trace.push(`Handler not found for type: ${currentNode.type}`);
        break;
      }

      const handlerNextNodeId = await handler.process(currentNode, {
        incomingMessage: this.incomingMessage,
      });

      if (currentNode.type === NodeType.CONDITION) {
        const logic = currentNode.data?.logic as NewConditionalState;

        if (logic?.logicNodeData && handlerNextNodeId) {
          const matchedCondition = logic.logicNodeData.find(
            (condition) => condition.outgoingNodeId === handlerNextNodeId,
          );

          if (matchedCondition) {
            this.chosenInput = matchedCondition.sectorId;
            trace.push(`Conditional matched: ${matchedCondition}`);
          }
        }

        if (!handlerNextNodeId) {
          return;
        }
      }

      let nextNodeId = handlerNextNodeId;

      if (!nextNodeId) {
        nextNodeId = this.getNextNodeId(currentNode);

        if (nextNodeId) {
          trace.push(`Using outgoingNodeId: ${nextNodeId}`);
        }
      }

      if (!nextNodeId) {
        if (
          this.onFinish &&
          ['text', 'image', 'file'].includes(currentNode.type)
        ) {
          trace.push('Flow finished, calling onFinish callback');
          this.onFinish(currentNode, this.chosenInput);
        } else {
          trace.push('Flow terminated, no next node found');
        }
        break;
      }

      trace.push(`Moving to next node: ${nextNodeId}`);
      this.currentNodeId = nextNodeId;
    }

    console.log(trace);
  }
}
