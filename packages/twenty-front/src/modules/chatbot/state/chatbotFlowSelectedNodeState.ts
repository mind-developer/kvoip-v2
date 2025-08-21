import { createState } from 'twenty-ui/utilities';
import { GenericNode } from '../types/GenericNode';

export const chatbotFlowSelectedNodeState = createState<GenericNode | undefined>({
  key: 'chatbotFlowSelectedNodeState',
  defaultValue: undefined,
});
