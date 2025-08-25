import { useChatbotFlowCommandMenu } from '@/chatbot/hooks/useChatbotFlowCommandMenu';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { useValidateChatbotFlow } from '@/chatbot/hooks/useValidateChatbotFlow';

import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPlus } from '@tabler/icons-react';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  NodeChange,
  NodeTypes,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { isDefined } from 'twenty-shared/utils';
import { Tag, TagColor } from 'twenty-ui/components';
import { Button } from 'twenty-ui/input';

import { useHandleNodeValue } from '../hooks/useHandleNodeValue';
import { GenericNode } from '../types/GenericNode';
import { ChatbotFlowData } from '../types/chatbotFlow.type';
import { chatbotFlowSelectedNodeState } from '../state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '../state/chatbotFlowState';

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
  chatbotId
}: BotDiagramBaseProps) => {
  const theme = useTheme();

  const chatbotFlowData = useRecoilState(chatbotFlowState)[0]

  const [nodes, setNodes] = useState<GenericNode[]>(chatbotFlowData?.nodes ?? []);
  const [edges, setEdges] = useState<Edge[]>(chatbotFlowData?.edges ?? []);


  const reactFlow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<GenericNode, Edge> | null>(null);

  //ideally remove this hook
  const { openChatbotFlowCommandMenu } = useChatbotFlowCommandMenu();

  //what exactly does this validation do? and what's up with the naming?
  const { chatbotFlow } = useValidateChatbotFlow();
  const hasValidatedRef = useRef(false);

  //ideally redo this hook...
  const { updateFlow } = useUpdateChatbotFlow();

  const selectedNode = useRecoilState(chatbotFlowSelectedNodeState)

  const { savePositionValue } = useHandleNodeValue();

  useEffect(() => {
    if (
      nodes.length > 0 &&
      edges.length > 0 &&
      chatbotId &&
      !hasValidatedRef.current
    ) {
      chatbotFlow({ nodes, edges, chatbotId: chatbotId });
      hasValidatedRef.current = true;
    }
  }, [nodes, edges, chatbotId]);

  const saveFlow = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      if (!chatbotId) return;

      const newFlow = { ...flow, chatbotId: chatbotId };
      updateFlow(newFlow as ChatbotFlowData);
    }
  }, [rfInstance]);

  const onNodesChange = useCallback(
    (newNodesState: NodeChange[]) =>
      setNodes((nds) => {
        const appliedNodeChanges = applyNodeChanges(structuredClone(newNodesState), structuredClone(nds))
        newNodesState.forEach((newNodeState: NodeChange) => {
          if (newNodeState.type === 'position' && !newNodeState.dragging) {
            updateFlow({ ...rfInstance!.toObject(), nodes: appliedNodeChanges, chatbotId })
          }
        })
        return appliedNodeChanges
      }),
    [selectedNode],
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

  //this is ok
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


  useEffect(() => {
    if (!isDefined(containerRef.current) || !reactFlow.viewportInitialized) {
      return;
    }

    const currentViewport = reactFlow.getViewport();
    const flowBounds = reactFlow.getNodesBounds(reactFlow.getNodes());

    const viewportX =
      (containerRef?.current?.offsetWidth ?? 0) / 2 -
      (flowBounds.width ?? 2) / 2;

    reactFlow.setViewport(
      { ...currentViewport, x: viewportX },
      { duration: 300 },
    );
  }, [reactFlow]);

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
            chatbotId && openChatbotFlowCommandMenu(chatbotId)
          }
        />
        <StyledButton accent="blue" title="Save" onClick={saveFlow} />
      </StyledButtonContainer>
    </StyledResetReactflowStyles>
  );
};

