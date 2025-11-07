import { Injectable } from '@nestjs/common';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import {
  CreateExecutorInput,
  ExecutorInput,
} from 'src/engine/core-modules/chatbot-runner/types/CreateExecutorInput';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
import { FlowNode } from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { NodeTypes } from 'src/engine/core-modules/chatbot-runner/types/NodeTypes';

@Injectable()
export class ChatbotRunnerService {
  executors: Record<string, ExecuteFlow>;
  constructor(
    private readonly textInputHandler: TextInputHandler,
    private readonly imageInputHandler: ImageInputHandler,
    private readonly fileInputHandler: FileInputHandler,
    private readonly conditionalInputHandler: ConditionalInputHandler,
  ) {
    this.executors = {};
  }

  createExecutor(i: CreateExecutorInput) {
    const executor = new ExecuteFlow({
      ...i,
      handlers: {
        [NodeTypes.TEXT]: this.textInputHandler,
        [NodeTypes.IMAGE]: this.imageInputHandler,
        [NodeTypes.CONDITIONAL]: this.conditionalInputHandler,
        [NodeTypes.FILE]: this.fileInputHandler,
      },
    });

    this.executors[i.clientChat.id] = executor;

    return executor;
  }

  getExecutor(key: string): ExecuteFlow | undefined {
    try {
      const executor = this.executors[key];
      return executor;
    } catch {
      return undefined;
    }
  }

  clearExecutor(key: string): void {
    delete this.executors[key];
  }
}
class ExecuteFlow {
  currentNodeId: string | undefined;
  chosenInput: string | undefined;
  constructor(private i: ExecutorInput) {
    console.log(
      'ExecuteFlow constructor - flowNodes:',
      JSON.stringify(this.i.chatbot.flowNodes, null, 2),
    );
    this.currentNodeId = this.i.chatbot.flowNodes.find(
      (node) => node.data?.nodeStart,
    )?.id;
    console.log('ExecuteFlow constructor - currentNodeId:', this.currentNodeId);
  }

  public async runFlow(incomingMessage: string) {
    console.log('runFlow called with incomingMessage:', incomingMessage);
    console.log('runFlow - current currentNodeId:', this.currentNodeId);
    while (this.currentNodeId) {
      const currentNode: FlowNode = this.i.chatbot.flowNodes.find(
        (node) => node.id === this.currentNodeId,
      );
      console.log(
        'runFlow - currentNode found:',
        JSON.stringify(currentNode, null, 2),
      );
      if (!currentNode || typeof currentNode.type !== 'string') {
        console.log('current node not found or type not string');
        break;
      }
      const handler = this.i.handlers[currentNode.type];
      if (!handler) {
        console.log('handler not found for node', currentNode.type);
        break;
      }
      console.log(
        'runFlow - calling handler.process for type:',
        currentNode.type,
      );
      const nextNodeId = await handler.process({
        provider: this.i.provider,
        providerIntegrationId: this.i.providerIntegrationId,
        workspaceId: this.i.workspaceId,
        clientChat: this.i.clientChat,
        chatbotName: this.i.chatbotName,
        sectors: this.i.sectors,
        node: currentNode,
        context: {
          incomingMessage,
        },
      });
      if (currentNode.type === NodeTypes.CONDITIONAL) {
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
          if (
            this.i.onFinish &&
            ['text', 'image', 'file', 'conditional'].includes(currentNode.type)
          ) {
            console.log('on finish', currentNode.type, this.chosenInput);
            this.i.onFinish(currentNode, this.chosenInput);
          }
          return null;
        }
      }
      if (!nextNodeId) {
        console.log(this.i.onFinish, currentNode.type);
        if (
          this.i.onFinish &&
          ['text', 'image', 'file', 'conditional'].includes(currentNode.type)
        ) {
          console.log('on finish', currentNode.type, this.chosenInput);
          this.i.onFinish(currentNode, this.chosenInput);
        }
        break;
      }
      this.currentNodeId = nextNodeId;
    }
  }
}
