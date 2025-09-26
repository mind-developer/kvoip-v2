import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import {
  CreateExecutorInput,
  ExecutorInput,
} from 'src/engine/core-modules/chatbot-runner/types/CreateExecutorInput';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-runner/types/LogicNodeDataType';
import { NodeTypes } from 'src/engine/core-modules/chatbot-runner/types/NodeTypes';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class ChatbotRunnerService {
  executors: Record<string, ExecuteFlow>;
  constructor(
    @InjectRepository(Workspace)
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
        [NodeTypes.CONDITION]: this.conditionalInputHandler,
        [NodeTypes.FILE]: this.fileInputHandler,
      },
    });

    this.executors[i.integrationId + '_' + i.sendTo] = executor;

    return executor;
  }

  getExecutor(key: string): ExecuteFlow | undefined {
    try {
      return this.executors[key];
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
    this.currentNodeId = this.i.chatbot.nodes.find(
      (node) => node.data?.nodeStart,
    )?.id;
  }

  public async runFlow(incomingMessage: string) {
    while (this.currentNodeId) {
      const currentNode = this.i.chatbot.nodes.find(
        (node) => node.id === this.currentNodeId,
      );

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler = this.i.handlers[currentNode.type];

      if (!handler) break;

      const nextNodeId = await handler.process({
        integrationId: this.i.integrationId,
        workspaceId: this.i.workspaceId,
        sendTo: this.i.sendTo,
        chatbotName: this.i.chatbotName,
        sectors: this.i.sectors,
        node: currentNode,
        context: {
          incomingMessage,
        },
      });

      if (currentNode.type === NodeTypes.CONDITION) {
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
          return null;
        }
      }

      if (!nextNodeId) {
        if (
          this.i.onFinish &&
          ['text', 'image', 'file'].includes(currentNode.type)
        ) {
          this.i.onFinish(currentNode, this.chosenInput);
        }
        break;
      }

      this.currentNodeId = nextNodeId;
    }
  }
}
