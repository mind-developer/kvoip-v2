import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';

export const sanitizeFlow = (flow: ChatbotWorkspaceEntity) => {
  return {
    ...flow,
    nodes: flow.nodes.map((item) => ({
      id: item.id,
      data: item.data,
      type: item.type,
      position: item.position,
      selected: item.selected,
    })),
  };
};
