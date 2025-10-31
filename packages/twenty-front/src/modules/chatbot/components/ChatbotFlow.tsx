import { type NodeTypes, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ConditionalNode from '@/chatbot/components/nodes/ConditionalNode';
import FileNode from '@/chatbot/components/nodes/FileNode';
import ImageNode from '@/chatbot/components/nodes/ImageNode';
import TextNode from '@/chatbot/components/nodes/TextNode';

import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';

import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';

import { useSetChatbotFlowState } from '@/chatbot/hooks/useSetChatbotFlowState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useParams } from 'react-router-dom';

const types: NodeTypes = {
  text: TextNode,
  condition: ConditionalNode,
  image: ImageNode,
  file: FileNode,
};

export const ChatbotFlow = () => {
  const { chatbotId } = useParams();
  const { records: chatbot } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    filter: {
      id: {
        eq: chatbotId,
      },
    },
    recordGqlFields: {
      id: true,
      flowNodes: true,
      flowEdges: true,
      viewport: true,
      status: true,
    },
  });
  const { setChatbotFlowState } = useSetChatbotFlowState();
  if (!chatbot[0]) return null;

  setChatbotFlowState({
    nodes: chatbot[0].flowNodes,
    edges: chatbot[0].flowEdges,
    chatbotId: chatbot[0].id,
    viewport: chatbot[0].viewport,
  });

  const status = chatbot[0]?.status ?? 'DEACTIVATED';

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  if (chatbot[0])
    return (
      <ReactFlowProvider>
        <BotDiagramBase
          nodeTypes={types}
          tagColor={tagProps.color}
          tagText={tagProps.text}
        />
      </ReactFlowProvider>
    );
};
