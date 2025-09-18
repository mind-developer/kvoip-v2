/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { useSaveChatbotFlowState } from '@/chatbot/hooks/useSaveChatbotFlowState';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

type ChatbotFlowImageEventFormProps = {
  selectedNode: Node;
};

const StyledStepBody = styled.div`
  background: ${({ theme }) => theme.background.primary};
  max-width: 240px;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
`;

export const ChatbotFlowImageEventForm = ({
  selectedNode,
}: ChatbotFlowImageEventFormProps) => {
  const [image, setImage] = useState(
    selectedNode.data?.imageUrl as string | undefined,
  );

  useEffect(() => {
    setImage(selectedNode.data?.imageUrl as string | undefined);
  }, [selectedNode.data]);

  const saveChatbotFlowState = useSaveChatbotFlowState();
  const { uploadFileToBucket } = useUploadFileToBucket();
  const { deleteSelectedNode } = useDeleteSelectedNode();

  const chatbotFlow = useGetChatbotFlowState();
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const handleSendFile = async (file: File) => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const url = await uploadFileToBucket({ file, type: 'image' });

    if (url && selectedNode) {
      setImage(url);

      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          imageUrl: url,
        },
      };

      const updatedNodes = chatbotFlow.nodes.map((node) =>
        node.id === selectedNode.id ? updatedNode : node,
      );

      saveChatbotFlowState({
        chatbotId: chatbotFlow.chatbotId,
        nodes: updatedNodes,
        edges: chatbotFlow.edges,
        viewport: { x: 0, y: 0, zoom: 0 },
      });
      setChatbotFlowSelectedNode(updatedNode);
    }
  };

  const handleRemoveFile = () => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        imageUrl: '',
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((node) =>
      node.id === selectedNode.id ? updatedNode : node,
    );

    saveChatbotFlowState({
      chatbotId: chatbotFlow.chatbotId,
      nodes: updatedNodes,
      edges: chatbotFlow.edges,
      viewport: { x: 0, y: 0, zoom: 0 },
    });

    setChatbotFlowSelectedNode(updatedNode);
  };

  return (
    <>
      <ChatbotFlowEventContainerForm
        onClick={() => deleteSelectedNode(selectedNode.id)}
      >
        <StyledStepBody>
          <ImageInput
            picture={image}
            onUpload={handleSendFile}
            onRemove={handleRemoveFile}
            maxSize="5"
          />
        </StyledStepBody>
      </ChatbotFlowEventContainerForm>
    </>
  );
};
