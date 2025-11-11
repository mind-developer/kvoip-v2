/* eslint-disable @nx/workspace-no-state-useref */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { ChatbotFlowEventContainerForm } from '@/chatbot/components/actions/ChatbotFlowEventContainerForm';
import { useDeleteSelectedNode } from '@/chatbot/hooks/useDeleteSelectedNode';
import { useGetChatbotFlowState } from '@/chatbot/hooks/useGetChatbotFlowState';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowNodes } from '@/chatbot/state/chatbotFlowState';
import { renameFile } from '@/chatbot/utils/renameFile';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import styled from '@emotion/styled';
import { type Node } from '@xyflow/react';
import { useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { H3Title, Label } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type ChatbotFlowFileEventFormProps = {
  selectedNode: Node;
};

const StyledStepBody = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  // padding-block: ${({ theme }) => theme.spacing(4)};
  // padding-inline: ${({ theme }) => theme.spacing(3)};
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledButton = styled(Button)`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.font.color.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

export const ChatbotFlowFileEventForm = ({
  selectedNode,
}: ChatbotFlowFileEventFormProps) => {
  const initialFile = selectedNode.data?.fileUrl as string | undefined;

  const [file, setFile] = useState<string | undefined>(initialFile);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { deleteSelectedNode } = useDeleteSelectedNode();
  const setChatbotFlowNodes = useSetRecoilState(chatbotFlowNodes);
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const chatbotFlow = useGetChatbotFlowState();

  const handleSendFile = async (file: File) => {
    if (!selectedNode) return;

    setFile(undefined);

    const attachment = await uploadAttachmentFile(file, {
      targetObjectNameSingular: CoreObjectNameSingular.Chatbot,
      id: chatbotFlow?.chatbotId,
    });

    if (attachment && selectedNode) {
      setFile(attachment.attachmentAbsoluteURL);

      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          fileUrl: attachment.attachmentAbsoluteURL,
        },
      };

      setChatbotFlowNodes((nodes) =>
        nodes.map((node) => (node.id === selectedNode.id ? updatedNode : node)),
      );
      setChatbotFlowSelectedNode([updatedNode]);
    }
  };

  return (
    <>
      <ChatbotFlowEventContainerForm
        onClick={() => deleteSelectedNode(selectedNode.id)}
      >
        <StyledStepBody>
          <StyledDiv>
            {file && (
              <StyledLink href={file} target="_blank" rel="noreferrer">
                <H3Title title={renameFile(file)} />
              </StyledLink>
            )}
            <StyledButton
              title="Upload file"
              onClick={() => fileInputRef.current?.click()}
            />
            <StyledInput
              ref={fileInputRef}
              type="file"
              accept=".pdf, .doc, .docx, .txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleSendFile(file);
                }
              }}
              style={{ display: 'none' }}
            />
            <Label>Upload a file up to 5mb</Label>
          </StyledDiv>
        </StyledStepBody>
      </ChatbotFlowEventContainerForm>
    </>
  );
};
