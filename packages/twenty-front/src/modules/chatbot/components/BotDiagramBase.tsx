/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-constant-condition */

import {
  initialEdges,
  initialNodes,
} from '@/chatbot/flow-templates/mockFlowTemplate';

import { useChatbotFlowCommandMenu } from '@/chatbot/hooks/useChatbotFlowCommandMenu';
import { useGetChatbotFlowById } from '@/chatbot/hooks/useGetChatbotFlowById';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { useValidateChatbotFlow } from '@/chatbot/hooks/useValidateChatbotFlow';
import { chatbotFlowIdState } from '@/chatbot/state/chatbotFlowIdState';

import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

// eslint-disable-next-line no-restricted-imports
import { IconPlus } from '@tabler/icons-react';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { isDefined } from 'twenty-shared/utils';
import { Tag, TagColor } from 'twenty-ui/components';
import { Button } from 'twenty-ui/input';

import { GenericNode } from '../types/GenericNode';
import { ChatbotFlowData } from '../types/chatbotFlow.type';

type BotDiagramBaseProps = {
  nodeTypes: NodeTypes;
  tagColor: TagColor;
  tagText: string;
  chatbotId: string;
};

const StyledResetReactflowStyles = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  /* Below we reset the default styling of Reactflow */
  .react-flow__node-input,
  .react-flow__node-default,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0;
    width: auto;
    text-align: start;
    white-space: nowrap;
  }

  .react-flow__handle {
    min-height: 0;
    min-width: 0;
  }

  .react-flow__handle-top {
    transform: translate(-50%, -50%);
  }

  .react-flow__handle-bottom {
    transform: translate(-50%, 100%);
  }

  .react-flow__handle.connectionindicator {
    cursor: pointer;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

const StyledStatusTagContainer = styled.div`
  display: flex;
  left: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  right: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled(Button)`
  height: 24px;
`;

export const BotDiagramBase = ({
  nodeTypes,
  tagColor,
  tagText,
}: BotDiagramBaseProps) => {
  const theme = useTheme();

  const [nodes, setNodes] = useState<GenericNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<Node, Edge> | null>(null);

  const { openChatbotFlowCommandMenu } = useChatbotFlowCommandMenu();
  const { chatbotFlow } = useValidateChatbotFlow();
  const { updateFlow } = useUpdateChatbotFlow();
  const chatbotFlowId = useRecoilValue(chatbotFlowIdState);

  const { chatbotFlowData, refetch } = useGetChatbotFlowById(
    chatbotFlowId ?? '',
  );

  // eslint-disable-next-line @nx/workspace-no-state-useref
  const hasValidatedRef = useRef(false);

  type FlowType = () => [GenericNode[], Edge[]] | undefined;

  const defineFlow: FlowType = () => {
    if (!chatbotFlowData) {
      return undefined;
    }
    return [chatbotFlowData.nodes, chatbotFlowData.edges];
  };

  useEffect(() => {
    const [resNode, resEdges] = defineFlow() ?? [];
    if (resNode && resEdges) {
      setNodes(resNode);
      setEdges(resEdges);
    }
  }, [chatbotFlowData]);

  useEffect(() => {
    if (
      nodes.length > 0 &&
      edges.length > 0 &&
      chatbotFlowId &&
      !hasValidatedRef.current
    ) {
      chatbotFlow({ nodes, edges, chatbotId: chatbotFlowId });
      hasValidatedRef.current = true;
      saveFlow();
    }
  }, [nodes, edges, chatbotFlowId]);

  const saveFlow = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      if (!chatbotFlowId) return;

      const newFlow = { ...flow, chatbotId: chatbotFlowId };
      updateFlow(newFlow as ChatbotFlowData);
      refetch();
    }
  }, [rfInstance]);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nds) =>
        applyNodeChanges(structuredClone(changes), structuredClone(nds)),
      ),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((eds) =>
        applyEdgeChanges(structuredClone(changes), structuredClone(eds)),
      ),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const targetAlreadyConnected = edges.some(
        (edge) => edge.target === connection.target,
      );
      if (!targetAlreadyConnected) {
        setEdges((eds) => addEdge(connection, eds));
      }
    },
    [edges, setEdges],
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!source || !target) return false;

      const sameSourceHandleAlreadyUsed = edges.some(
        (edge) =>
          edge.source === source && edge.sourceHandle === sourceHandle,
      );
      const sameTargetHandleAlreadyUsed = edges.some(
        (edge) =>
          edge.target === target && edge.targetHandle === targetHandle,
      );

      return !sameSourceHandleAlreadyUsed && !sameTargetHandleAlreadyUsed;
    },
    [edges],
  );

  const reactflow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDefined(containerRef.current) || !reactflow.viewportInitialized) {
      return;
    }

    const currentViewport = reactflow.getViewport();
    const flowBounds = reactflow.getNodesBounds(reactflow.getNodes());

    const viewportX =
      (containerRef?.current?.offsetWidth ?? 0) / 2 -
      (flowBounds.width ?? 2) / 2;

    reactflow.setViewport(
      { ...currentViewport, x: viewportX },
      { duration: 300 },
    );
  }, [reactflow]);

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <WorkflowDiagramCustomMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitViewOptions={{ padding: 2 }}
        isValidConnection={isValidConnection}
        fitView
      >
        <Controls showZoom={true} />
        <Background color={theme.border.color.medium} size={2} />
      </ReactFlow>

      <StyledStatusTagContainer data-testid={'tagContainerBotDiagram'}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>

      <StyledButtonContainer>
        <StyledButton
          accent="default"
          Icon={IconPlus}
          title="Add node"
          onClick={() =>
            chatbotFlowId && openChatbotFlowCommandMenu(chatbotFlowId)
          }
        />
        <StyledButton accent="blue" title="Save" onClick={saveFlow} />
      </StyledButtonContainer>
    </StyledResetReactflowStyles>
  );
};

