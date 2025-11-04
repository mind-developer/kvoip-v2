import { v4 } from 'uuid';

export const createNode = (type: 'text' | 'image' | 'file' | 'conditional') => {
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
          title: 'Send text',
        },
      };
    case 'conditional': {
      // TODO: Missing 'recordType' property
      return {
        ...baseNode,
        data: { title: 'Conditional node' },
      };
    }
    case 'image':
      return {
        ...baseNode,
        data: {
          title: 'Send image',
          imageUrl: '',
        },
      };
    case 'file':
      return {
        ...baseNode,
        data: {
          title: 'Send file',
          fileUrl: '',
        },
      };
  }
};
