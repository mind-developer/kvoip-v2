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
import { SendMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { Repository } from 'typeorm';

export class ChatbotFlowService {
  constructor(
    @InjectRepository(ChatbotFlow, 'core')
    private readonly chatbotFlowRepository: Repository<ChatbotFlow>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

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

export class ExecuteFlow {
  workspaceId: string;
  integrationId: string;
  chatbotName: string;
  nodes: Node[];
  currentNodeId: string | undefined;
  handlers: Record<string, NodeHandler>;
  chosenInput?: string;
  onFinish: (finalNode: Node, chosenInput?: string) => void;

  constructor(
    integrationId: string,
    chatbotName: string,
    chatbotFlow: Omit<
      ChatbotFlow,
      'workspace' | 'chatbotId' | 'viewport' | 'id'
    > & { workspace: { id: string } },
    sendTo: string,
    personId: string,
    sectors: { id: string; name: string }[],
    sendMessage: (input: SendMessageInput, workspaceId: string) => Promise<any>,
    onFinish: (finalNode: Node, chosenInput?: string) => void,
  ) {
    this.nodes = chatbotFlow.nodes;
    this.currentNodeId = this.nodes.find((node) => node.data?.nodeStart)?.id;
    this.chatbotName = chatbotName;
    console.log('building flow');

    this.handlers = {
      [NodeTypes.TEXT]: new TextInputHandler(
        sendMessage,
        integrationId,
        sendTo,
        personId,
        chatbotName,
        chatbotFlow.workspace.id,
      ),
      [NodeTypes.CONDITION]: new ConditionalInputHandler(
        sendMessage,
        integrationId,
        sendTo,
        personId,
        chatbotName,
        sectors,
        chatbotFlow.workspace.id,
      ),
      [NodeTypes.IMAGE]: new ImageInputHandler(
        sendMessage,
        integrationId,
        sendTo,
        personId,
        chatbotName,
        chatbotFlow.workspace.id,
      ),
      [NodeTypes.FILE]: new FileInputHandler(
        sendMessage,
        integrationId,
        sendTo,
        personId,
        chatbotName,
        chatbotFlow.workspace.id,
      ),
    };

    this.onFinish = onFinish;
  }

  public async runFlow(incomingMessage: string): Promise<void> {
    console.log('running flow for message:', incomingMessage);
    while (this.currentNodeId) {
      const currentNode = this.nodes.find(
        (node) => node.id === this.currentNodeId,
      );

      if (!currentNode || typeof currentNode.type !== 'string') break;

      const handler = this.handlers[currentNode.type];

      if (!handler) break;

      const nextNodeId = await handler.process(currentNode, {
        incomingMessage: incomingMessage,
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
}
