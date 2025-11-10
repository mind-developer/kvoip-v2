import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { ImageInput } from '@/ui/input/components/ImageInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useEffect, useState } from 'react';

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

  const { uploadFileToBucket } = useUploadFileToBucket();
  const { deleteSelectedNode } = useDeleteSelectedNode();
  const { saveDataValue } = useHandleNodeValue();

  const chatbotFlow = useGetChatbotFlowState();

  const handleSendFile = async (file: File) => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const url = await uploadFileToBucket({ file, type: 'image' });

    if (url && selectedNode) {
      setImage(url);
      saveDataValue('imageUrl', url, selectedNode);
    }
  };

  const handleRemoveFile = () => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    saveDataValue('imageUrl', '', selectedNode);
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
