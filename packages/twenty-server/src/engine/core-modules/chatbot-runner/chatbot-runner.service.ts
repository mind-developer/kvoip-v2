import { Injectable, Logger } from '@nestjs/common';
import { ConditionalInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ConditionalInputHandler';
import { FileInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/FileInputHandler';
import { ImageInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/ImageInputHandler';
import { TextInputHandler } from 'src/engine/core-modules/chatbot-runner/engine/handlers/TextInputHandler';
import {
  CreateExecutorInput,
  ExecutorInput,
} from 'src/engine/core-modules/chatbot-runner/types/CreateExecutorInput';
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
    const executorKey = i.clientChat.id;
    const executor = new ExecuteFlow({
      ...i,
      handlers: {
        [NodeTypes.TEXT]: this.textInputHandler,
        [NodeTypes.IMAGE]: this.imageInputHandler,
        [NodeTypes.CONDITIONAL]: this.conditionalInputHandler,
        [NodeTypes.FILE]: this.fileInputHandler,
      },
      clearExecutor: () => {
        this.clearExecutor(executorKey);
      },
    });

    this.executors[executorKey] = executor;

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
  private askedNodes: Set<string> = new Set<string>(); // Estado por executor (chat)
  private readonly logger = new Logger(ExecuteFlow.name);
  constructor(private i: ExecutorInput) {
    this.currentNodeId = this.i.chatbot.flowNodes.find(
      (node) => node.data?.nodeStart,
    )?.id;
  }

  public async runFlow(incomingMessage: string) {
    let lastNode: FlowNode | undefined;
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
        workspaceId: this.i.workspaceId,
        provider: this.i.provider,
        providerIntegrationId: this.i.providerIntegrationId,
        clientChat: this.i.clientChat,
        chatbot: this.i.chatbot,
        node: currentNode,
        context: {
          incomingMessage,
        },
        askedNodes: this.askedNodes, // Passa o estado para o handler
      });
      this.logger.log(
        `ExecuteFlow: Handler retornou nextNodeId=${nextNodeId} para node ${currentNode.id} (tipo: ${currentNode.type})`,
      );
      if (currentNode.type === NodeTypes.CONDITIONAL && !nextNodeId) {
        this.logger.log(
          `ExecuteFlow: Nó CONDITIONAL retornou null, aguardando resposta do usuário - mantendo executor ativo`,
        );
        return null;
      }
      if (!nextNodeId) {
        // Fluxo terminou - não há mais nós para executar
        this.logger.log(
          `ExecuteFlow: Fluxo terminou no node ${currentNode.id} (tipo: ${currentNode.type})`,
        );
        if (this.i.onFinish) {
          this.logger.log(
            `ExecuteFlow: Chamando onFinish para node ${currentNode.id}`,
          );
          this.i.onFinish();
        }
        // Limpar currentNodeId para indicar que o fluxo terminou
        this.currentNodeId = undefined;
        // Remover executor já que o fluxo terminou
        this.i.clearExecutor();
        break;
      }
      this.logger.log(
        `ExecuteFlow: Atualizando currentNodeId de ${this.currentNodeId} para ${nextNodeId}`,
      );
      this.currentNodeId = nextNodeId;
    }
  }
}
