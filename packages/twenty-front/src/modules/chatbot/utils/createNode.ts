import { NewLogicNodeData } from '@/chatbot/types/LogicNodeDataType';
import { v4 } from 'uuid';

export const createNode = (type: string) => {
  const baseNode = {
    id: v4(),
    type,
    position: { x: 0, y: 0 },
  };

  switch (type) {
    case 'text':
      return {
        ...baseNode,
        data: {
          nodeStart: false,
          title: 'Send text'
        },
      };
    case 'condition': {
      const initialLogicNode: NewLogicNodeData = {
        option: '1',
        comparison: '==',
        sectorId: '',
        conditionValue: '||',
        recordType: 'text'
      };

      return {
        ...baseNode,
        data: {
          title: "Conditional node",
          logic: {
            logicNodes: [0],
            logicNodeData: [initialLogicNode],
          },
        },
      };
    }
    case 'image':
      return {
        ...baseNode,
        data: {
          title: "Send image",
          imageUrl: '',
        },
      };
    case 'file':
      return {
        ...baseNode,
        data: {
          title: "Send file",
          fileUrl: '',
        },
      };
  }
};
