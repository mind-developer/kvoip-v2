import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';
import { UpdateChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/update-chatbot-flow.input';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import {
  CreateExecutorInput,
  ExecutorInput,
} from 'src/engine/core-modules/chatbot-flow/types/CreateExecutorInput';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-flow/types/LogicNodeDataType';
import { NodeTypes } from 'src/engine/core-modules/chatbot-flow/types/NodeTypes';
import { sanitizeFlow } from 'src/engine/core-modules/chatbot-flow/utils/sanitizeChatbotFlow';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatbotFlowService {
  executors: Record<string, ExecuteFlow>;
  constructor(
    @InjectRepository(ChatbotFlow, 'core')
    private readonly chatbotFlowRepository: Repository<ChatbotFlow>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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
    console.log('cbfs: created executor');

    return executor;
  }

  getExecutor(key: string): ExecuteFlow | undefined {
    try {
      console.log('cbfs: fetching executor', key);
      return this.executors[key];
    } catch {
      return undefined;
    }
  }

  clearExecutor(key: string): void {
    delete this.executors[key];
  }

  async validateOrCreateFlow(
    flow: ChatbotFlowInput,
    workspaceId: string,
  ): Promise<ChatbotFlow> {
    const chatbotFlow = await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: flow.chatbotId,
      },
    });

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (chatbotFlow) {
      return { ...chatbotFlow, workspace };
    }

    const newFlow = sanitizeFlow(flow);

    const createdFlow = this.chatbotFlowRepository.create({
      ...newFlow,
      workspace: workspace,
    });

    return await this.chatbotFlowRepository.save(createdFlow);
  }

  async findById(chatbotId: string): Promise<ChatbotFlow | null> {
    return await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: chatbotId,
      },
    });
  }

  async updateFlow(flow: UpdateChatbotFlowInput): Promise<ChatbotFlow | null> {
    const chatbotFlow = await this.chatbotFlowRepository.findOne({
      where: {
        chatbotId: flow.chatbotId,
      },
    });

    if (!chatbotFlow) {
      throw new Error('Flow not found');
    }

    const newFlow = sanitizeFlow(flow);

    const updateFlow = {
      ...chatbotFlow,
      ...newFlow,
    };

    return await this.chatbotFlowRepository.save(updateFlow);
  }
}

class ExecuteFlow {
  currentNodeId: string | undefined;
  chosenInput: string | undefined;
  constructor(private i: ExecutorInput) {
    this.currentNodeId = this.i.chatbotFlow.nodes.find(
      (node) => node.data?.nodeStart,
    )?.id;
  }

  public async runFlow(incomingMessage: string) {
    console.log('cbfs: running flow for', incomingMessage);
    while (this.currentNodeId) {
      const currentNode = this.i.chatbotFlow.nodes.find(
        (node) => node.id === this.currentNodeId,
      );

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler = this.i.handlers[currentNode.type];

      if (!handler) break;

      const nextNodeId = await handler.process({
        integrationId: this.i.integrationId,
        workspaceId: this.i.workspaceId,
        sendTo: this.i.sendTo,
        personId: this.i.personId,
        chatbotName: this.i.chatbotName,
        sectors: this.i.sectors,
        node: currentNode,
        onMessage: this.i.onMessage,
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
