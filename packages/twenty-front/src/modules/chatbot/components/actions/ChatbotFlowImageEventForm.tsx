import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Label } from 'twenty-ui/display';

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
  const initialTitle = (selectedNode.data.title as string) ?? 'Node title';
  const initialImage = selectedNode.data?.imageUrl as string | undefined;

  const [title, setTitle] = useState(initialTitle);
  const [image, setImage] = useState<string | undefined>(initialImage);

  const { updateFlow } = useUpdateChatbotFlow();
  const { uploadFileToBucket } = useUploadFileToBucket();
  const { deleteSelectedNode } = useDeleteSelectedNode();

  const chatbotFlow = useRecoilValue(chatbotFlowState);
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleFieldBlur = (field: 'title', value: string) => {
    if (!selectedNode || !chatbotFlow) return;

    const updatedNode: Node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((node) =>
      node.id === selectedNode.id ? updatedNode : node,
    );

    // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
    // TODO: Build a type using Omit<...> instead.
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
    updateFlow(updatedChatbotFlow);
  };

  const handleSendFile = async (file: File) => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const url = await uploadFileToBucket({ file, type: 'image' });

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
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

      // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
      // TODO: Build a type using Omit<...> instead.
      const { id, __typename, workspace, ...chatbotFlowWithoutId } =
        chatbotFlow;

      const updatedChatbotFlow = {
        ...chatbotFlowWithoutId,
        nodes: updatedNodes,
        viewport: { x: 0, y: 0, zoom: 0 },
      };

      setChatbotFlowSelectedNode(updatedNode);
      updateFlow(updatedChatbotFlow);
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

    // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
    // TODO: Build a type using Omit<...> instead.
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
    updateFlow(updatedChatbotFlow);
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
