import { Node } from '@xyflow/react';

export type NodeHandler = {
  process(
    integrationId: string,
    workspaceId: string,
    sendTo: string,
    personId: string,
    chatbotName: string,
    sectors: { id: string; name: string }[],
    node: Node,
    context: { incomingMessage: string },
  ): Promise<string | null>;
};
