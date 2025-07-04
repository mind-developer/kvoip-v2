import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import { ChatbotFlowDiagramCanvasEditableEffect } from '@/chatbot/components/ChatbotFlowDiagramCanvasEditableEffect';
import CondicionalNode from '@/chatbot/components/ui/CondicionalNode';
import FileNode from '@/chatbot/components/ui/FileNode';
import ImageNode from '@/chatbot/components/ui/ImageNode';
import TextNode from '@/chatbot/components/ui/TextNode';
import { useGetChatbot } from '@/chatbot/hooks/useGetChatbot';
import { chatbotFlowIdState } from '@/chatbot/state/chatbotFlowIdState';
import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';
import { NodeTypes, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

interface TargetableObject {
  id: string;
  targetObjectNameSingular: string;
}

const types: NodeTypes = {
  text: TextNode,
  condition: CondicionalNode,
  image: ImageNode,
  file: FileNode,
};

export const ChatbotFlow = ({
  targetableObject,
}: {
  targetableObject: TargetableObject;
}) => {
  const { chatbot } = useGetChatbot(targetableObject.id);

  const setChatbotFlowId = useSetRecoilState(chatbotFlowIdState);

  useEffect(() => {
    setChatbotFlowId(targetableObject.id);
  }, [chatbot, setChatbotFlowId, targetableObject.id]);

  const status = chatbot?.statuses ?? 'DEACTIVATED';

  if (!status) return;

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  // Enter the types of nodes and edges here in BotDiagramBase
  return (
    <ReactFlowProvider>
      <BotDiagramBase
        nodeTypes={types}
        tagColor={tagProps.color}
        tagText={tagProps.text}
        chatbotId={chatbot?.id ? chatbot.id : ''}
      />

      <ChatbotFlowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
