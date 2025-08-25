import '@xyflow/react/dist/style.css';
import { NodeTypes, ReactFlowProvider } from '@xyflow/react';

import ConditionalNode from '@/chatbot/components/nodes/ConditionalNode';
import FileNode from '@/chatbot/components/nodes/FileNode';
import ImageNode from '@/chatbot/components/nodes/ImageNode';
import TextNode from '@/chatbot/components/nodes/TextNode';

import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import { ChatbotFlowDiagramCanvasEditableEffect } from '@/chatbot/components/ChatbotFlowDiagramCanvasEditableEffect';

import { useGetChatbot } from '@/chatbot/hooks/useGetChatbot';
import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';
import { GET_CHATBOT_FLOW_BY_ID } from '../graphql/query/getChatbotFlowById';
import { chatbotFlowState } from '../state/chatbotFlowState';

import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
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

  const setFlowState = useSetRecoilState(chatbotFlowState)
  const [canRender, setCanRender] = useState(false)

  const { refetch, loading } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId: targetableObjectId },
    onCompleted: (d) => {
      setFlowState(d.getChatbotFlowById)
      setCanRender(true)
    },
    onError: () => {
      setFlowState({ nodes: initialNodes, edges: initialEdges, chatbotId: targetableObjectId })
      setCanRender(true)
    }
  });

  useEffect(() => {
    if (chatbot?.id) refetch()
  }, [chatbot]);

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  if (loading) return <p>Loading</p>
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
