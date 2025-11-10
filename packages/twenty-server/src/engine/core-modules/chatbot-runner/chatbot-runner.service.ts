import { Injectable, Logger } from '@nestjs/common';
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
      console.log('ChatbotRunnerService.getExecutor', {
        key,
        found: !!executor,
        executorKeys: Object.keys(this.executors),
        currentNodeId: executor ? (executor as any).currentNodeId : undefined,
      });
      return executor;
    } catch {
      return undefined;
    }
  }

  clearExecutor(key: string): void {
    console.log('ChatbotRunnerService.clearExecutor', {
      key,
      hadExecutor: !!this.executors[key],
      executorKeys: Object.keys(this.executors),
    });
    delete this.executors[key];
  }
}
class ExecuteFlow {
  currentNodeId: string | undefined;
  chosenInput: string | undefined;
  askedNodes: Set<string>; // Estado por executor (chat)
  private readonly logger = new Logger(ExecuteFlow.name);
  constructor(private i: ExecutorInput) {
    this.currentNodeId = this.i.chatbot.flowNodes.find(
      (node) => node.data?.nodeStart,
    )?.id;
    this.askedNodes = new Set<string>(); // Inicializa o estado por executor
  }

  public async runFlow(incomingMessage: string) {
    let lastNode: FlowNode | undefined;
    let onFinishCalled = false;
    this.logger.log(
      `ExecuteFlow: Iniciando runFlow com incomingMessage="${incomingMessage}", currentNodeId=${this.currentNodeId}`,
    );
    while (this.currentNodeId) {
      const currentNode: FlowNode = this.i.chatbot.flowNodes.find(
        (node) => node.id === this.currentNodeId,
      );
      if (!currentNode) {
        this.logger.warn(
          `ExecuteFlow: Nó não encontrado: ${this.currentNodeId}`,
        );
        break;
      }
      lastNode = currentNode;
      this.logger.log(
        `ExecuteFlow: Processando node ${currentNode.id} (tipo: ${currentNode.type})`,
      );
      const handler = this.i.handlers[currentNode.type];
      if (!handler) {
        this.logger.error('handler not found for node', currentNode.type);
        break;
      }
      this.logger.log(
        `ExecuteFlow: Chamando handler.process para node ${currentNode.id} (tipo: ${currentNode.type})`,
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
        askedNodes: this.askedNodes, // Passa o estado para o handler
      });
      this.logger.log(
        `ExecuteFlow: Handler retornou nextNodeId=${nextNodeId} para node ${currentNode.id} (tipo: ${currentNode.type})`,
      );
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
          this.logger.log(
            `ExecuteFlow: Nó CONDITIONAL retornou null, aguardando resposta do usuário - mantendo executor ativo`,
          );
          // Não chama onFinish aqui - o executor deve permanecer ativo para processar a próxima mensagem
          return null;
        }
      }
      if (!nextNodeId) {
        this.logger.error(this.i.onFinish, currentNode.type);
        if (
          this.i.onFinish &&
          ['text', 'image', 'file', 'conditional'].includes(currentNode.type)
        ) {
          this.i.onFinish(currentNode, this.chosenInput);
          onFinishCalled = true;
          // Limpar currentNodeId para indicar que o fluxo terminou
          this.currentNodeId = undefined;
        }
        break;
      }
      // Verificar se o próximo nó existe antes de continuar
      const nextNodeExists = this.i.chatbot.flowNodes.some(
        (node) => node.id === nextNodeId,
      );
      if (!nextNodeExists) {
        this.logger.warn('nextNodeId não encontrado:', nextNodeId);
        if (
          this.i.onFinish &&
          ['text', 'image', 'file', 'conditional'].includes(currentNode.type)
        ) {
          this.logger.warn(
            'on finish (next node not found)',
            currentNode.type,
            this.chosenInput,
          );
          this.i.onFinish(currentNode, this.chosenInput);
          onFinishCalled = true;
          // Limpar currentNodeId para indicar que o fluxo terminou
          this.currentNodeId = undefined;
        }
        break;
      }
      this.logger.log(
        `ExecuteFlow: Atualizando currentNodeId de ${this.currentNodeId} para ${nextNodeId}`,
      );
      this.currentNodeId = nextNodeId;
    }
    // Garantir que onFinish seja chamado quando o fluxo termina
    if (!onFinishCalled && this.i.onFinish && lastNode) {
      if (['text', 'image', 'file', 'conditional'].includes(lastNode.type)) {
        this.logger.warn(
          'on finish (end of flow)',
          lastNode.type,
          this.chosenInput,
        );
        this.i.onFinish(lastNode, this.chosenInput);
        onFinishCalled = true;
        // Limpar currentNodeId para indicar que o fluxo terminou
        this.currentNodeId = undefined;
      }
    }
  }
}
