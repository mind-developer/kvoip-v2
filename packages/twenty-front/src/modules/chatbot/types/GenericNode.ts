import { Node } from '@xyflow/react';
import { NewConditionalState } from './LogicNodeDataType';

export type GenericNode = Node & {
  id: string;
  nodeStart?: boolean;
  data: GenericNodeData;
};

export type GenericNodeData = {
  title?: string;
  text?: string;
  logic?: NewConditionalState;
};
