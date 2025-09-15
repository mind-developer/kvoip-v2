import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Node } from '@xyflow/react';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';
import { UpdateChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/update-chatbot-flow.input';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-flow/engine/handlers/TextInputHandler';
import { NewConditionalState } from 'src/engine/core-modules/chatbot-flow/types/LogicNodeDataType';
import { NodeHandler } from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
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

  createExecutor(
    integrationId: string,
    workspaceId: string,
    chatbotName: string,
    chatbotFlow: Omit<
      ChatbotFlow,
      'workspace' | 'chatbotId' | 'viewport' | 'id'
    > & { workspace: { id: string } },
    sendTo: string,
    personId: string,
    sectors: { id: string; name: string }[],
    onFinish: (finalNode: Node, chosenInput?: string) => void,
  ) {
    const executor = new ExecuteFlow(
      integrationId,
      workspaceId,
      chatbotName,
      chatbotFlow,
      sendTo,
      personId,
      sectors,
      onFinish,
      {
        [NodeTypes.TEXT]: this.textInputHandler,
        [NodeTypes.IMAGE]: this.imageInputHandler,
        [NodeTypes.CONDITION]: this.conditionalInputHandler,
        [NodeTypes.FILE]: this.fileInputHandler,
      },
    );
    console.log(typeof chatbotName);

    this.executors[integrationId + '_' + sendTo] = executor;

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
  private nodes: Node[];
  private currentNodeId: string | undefined;
  private chosenInput: string | undefined;

  constructor(
    private integrationId: string,
    private workspaceId: string,
    private chatbotName: string,
    private chatbotFlow: Omit<
      ChatbotFlow,
      'workspace' | 'chatbotId' | 'viewport' | 'id'
    > & { workspace: { id: string } },
    private sendTo: string,
    private personId: string,
    private sectors: { id: string; name: string }[],
    private onFinish: (finalNode: Node, chosenInput?: string) => void,
    private handlers: { [key: string]: NodeHandler },
  ) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.nodes.find((node) => node.data?.nodeStart)?.id;
    this.chatbotName = chatbotName;
    this.sendTo = sendTo;
    this.personId = personId;
    this.integrationId = integrationId;
    this.workspaceId = chatbotFlow.workspace.id;
    this.sectors = sectors;
    this.chosenInput = undefined;
  }

  public async runFlow(incomingMessage: string) {
    while (this.currentNodeId) {
      const currentNode = this.nodes.find(
        (node) => node.id === this.currentNodeId,
      );

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler = this.handlers[currentNode.type];

      if (!handler) break;

      const nextNodeId = await handler.process(
        this.integrationId,
        this.workspaceId,
        this.sendTo,
        this.personId,
        this.chatbotName,
        this.sectors,
        currentNode,
        {
          incomingMessage,
        },
      );

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
}
