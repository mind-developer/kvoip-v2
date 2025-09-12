import { Node } from '@xyflow/react';

export type NodeHandler = {
  process(
    node: Node,
    context: { incomingMessage: string },
  ): Promise<string | null>;
};
