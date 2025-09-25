/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { NodeTypes, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ConditionalNode from '@/chatbot/components/nodes/ConditionalNode';
import FileNode from '@/chatbot/components/nodes/FileNode';
import ImageNode from '@/chatbot/components/nodes/ImageNode';
import TextNode from '@/chatbot/components/nodes/TextNode';

import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import { ChatbotFlowDiagramCanvasEditableEffect } from '@/chatbot/components/ChatbotFlowDiagramCanvasEditableEffect';

import { useGetChatbot } from '@/chatbot/hooks/useGetChatbot';
import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';
import { GET_CHATBOT_FLOW_BY_ID } from '../graphql/query/getChatbotFlowById';

import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { useSetChatbotFlowState } from '@/chatbot/hooks/useSetChatbotFlowState';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { initialEdges, initialNodes } from '../flow-templates/mockFlowTemplate';

const types: NodeTypes = {
  text: TextNode,
  condition: ConditionalNode,
  image: ImageNode,
  file: FileNode,
};

export const ChatbotFlow = ({
  targetableObjectId,
}: {
  targetableObjectId: string;
}) => {
  const { chatbot } = useGetChatbot(targetableObjectId);
  const status = chatbot?.statuses ?? 'DEACTIVATED';

  const chatbotFlow = useGetChatbotFlowState();
  const { setChatbotFlowState } = useSetChatbotFlowState();
  const [canRender, setCanRender] = useState(false);

  const { refetch, loading } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId: targetableObjectId },
    onCompleted: (d) => {
      setChatbotFlowState(d.getChatbotFlowById);
      setCanRender(true);
    },
    onError: () => {
      setChatbotFlowState({
        nodes: initialNodes,
        edges: initialEdges,
        chatbotId: targetableObjectId,
      });
      setCanRender(true);
    },
  });

  useEffect(() => {
    if (chatbot?.id) refetch();
  }, [chatbot]);

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  if (loading) return <p>Loading</p>;
  if (canRender) {
    return (
      <ReactFlowProvider>
        <BotDiagramBase
          nodeTypes={types}
          tagColor={tagProps.color}
          tagText={tagProps.text}
          chatbotId={targetableObjectId}
        />
        <ChatbotFlowDiagramCanvasEditableEffect />
      </ReactFlowProvider>
    );
  }
};
