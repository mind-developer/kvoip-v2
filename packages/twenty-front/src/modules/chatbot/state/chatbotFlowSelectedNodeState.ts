import { createState } from 'twenty-ui/utilities';
import { type GenericNode } from '../types/GenericNode';

export const chatbotFlowSelectedNodeState = createState<GenericNode[]>({
  key: 'chatbotFlowSelectedNodeState',
  defaultValue: [],
});
