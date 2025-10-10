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

import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';

import { useSetChatbotFlowState } from '@/chatbot/hooks/useSetChatbotFlowState';
import { ChatbotFlowData } from '@/chatbot/types/chatbotFlow.type';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useEffect } from 'react';

const types: NodeTypes = {
  text: TextNode,
  condition: ConditionalNode,
  image: ImageNode,
  file: FileNode,
};

export const ChatbotFlow = ({ chatbotId }: { chatbotId: string }) => {
  const { record: chatbot } = useFindOneRecord<
    Omit<ChatbotFlowData, 'id'> & { id: string; __typename: string }
  >({
    objectNameSingular: 'chatbot',
    objectRecordId: chatbotId,
  });
  const { setChatbotFlowState } = useSetChatbotFlowState();
  const status = chatbot?.status ?? 'DEACTIVATED';

  useEffect(() => {
    if (chatbot) setChatbotFlowState(chatbot);
  }, [chatbot]);

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  if (chatbot)
    return (
      <ReactFlowProvider>
        <BotDiagramBase
          nodeTypes={types}
          tagColor={tagProps.color}
          tagText={tagProps.text}
          chatbotId={chatbot.id}
        />
        <ChatbotFlowDiagramCanvasEditableEffect />
      </ReactFlowProvider>
    );
};
