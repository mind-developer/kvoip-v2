/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useChatbotFlowCommandMenu } from '@/chatbot/hooks/useChatbotFlowCommandMenu';

import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramCustomMarkers';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
  NodeTypes,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isDefined } from 'twenty-shared/utils';
import { Tag, TagColor } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

import { ChatbotActionMenu } from '@/chatbot/components/actions/ChatbotActionMenu';
import {
  initialEdges,
  initialNodes,
} from '@/chatbot/flow-templates/mockFlowTemplate';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useParams } from 'react-router-dom';
import { chatbotFlowEdges, chatbotFlowNodes } from '../state/chatbotFlowState';
import { GenericNode } from '../types/GenericNode';

type BotDiagramBaseProps = {
  nodeTypes: NodeTypes;
  tagColor: TagColor;
  tagText: string;
};

const StyledResetReactflowStyles = styled.div`
  height: 100%;
  width: 100%;
  min-height: 600px;
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
  const { chatbotId } = useParams();

  const nodes = useRecoilValue(chatbotFlowNodes) ?? initialNodes;
  const edges = useRecoilValue(chatbotFlowEdges) ?? initialEdges;
  const setNodes = useSetRecoilState(chatbotFlowNodes);
  const setEdges = useSetRecoilState(chatbotFlowEdges);

  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const reactFlow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    GenericNode,
    Edge
  > | null>(null);

  const { openChatbotFlowCommandMenu } = useChatbotFlowCommandMenu();

  const hasValidatedRef = useRef(false);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    recordGqlFields: {
      id: true,
    },
  });

  useEffect(() => {
    if (
      nodes.length > 0 &&
      edges.length > 0 &&
      chatbotId &&
      !hasValidatedRef.current
    ) {
      hasValidatedRef.current = true;
    }
  }, [nodes, edges, chatbotId]);

  const handleSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      if (!chatbotId) return;

      const newFlow = { ...flow, chatbotId: chatbotId };
      updateOneRecord({
        idToUpdate: chatbotId,
        updateOneRecordInput: {
          nodes: newFlow.nodes,
          edges: newFlow.edges,
          viewport: newFlow.viewport,
        },
      });
    }
  }, [rfInstance]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) =>
        applyNodeChanges(
          structuredClone(changes),
          structuredClone(nds ?? initialNodes),
        ),
      ),
    [],
  );

  const onEdgesChange = useCallback(
    (newEdgesState: EdgeChange[]) =>
      setEdges((eds: Edge[]) => {
        const appliedEdgeChanges = applyEdgeChanges(
          structuredClone(newEdgesState),
          structuredClone(eds ?? initialEdges),
        );
        if (rfInstance) {
          updateOneRecord({
            idToUpdate: chatbotId ?? '',
            updateOneRecordInput: {
              nodes: rfInstance.toObject().nodes,
              edges: appliedEdgeChanges,
              viewport: rfInstance.toObject().viewport,
            },
          });
        }
        return appliedEdgeChanges;
      }),
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
        (edge) => edge.source === source && edge.sourceHandle === sourceHandle,
      );

      const sameTargetHandleAlreadyUsed = edges.some(
        (edge) => edge.target === target && edge.targetHandle === targetHandle,
      );

      return !sameSourceHandleAlreadyUsed && !sameTargetHandleAlreadyUsed;
    },
    [edges],
  );

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen((prev) => !prev);
  };

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
        onClick={() => {
          setIsContextMenuOpen(false);
          setChatbotFlowSelectedNode(undefined);
        }}
        onDragStart={() => setIsContextMenuOpen(false)}
        onNodeClick={(event, node) => {
          event.stopPropagation();
          setChatbotFlowSelectedNode(node);
          console.log(node);
        }}
        onContextMenu={handleContextMenu}
      >
        <Controls showZoom={true} />
        <Background bgColor={theme.background.primary} size={2} />
      </ReactFlow>

      <StyledStatusTagContainer data-testid={'tagContainerBotDiagram'}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>

      {isContextMenuOpen && (
        <div
          style={{
            position: 'relative',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <ChatbotActionMenu />
        </div>
      )}

      <StyledButtonContainer>
        <StyledButton
          accent="default"
          Icon={IconPlus}
          title="Add node"
          onClick={() => chatbotId && openChatbotFlowCommandMenu(chatbotId)}
        />
        <StyledButton accent="blue" title="Save" onClick={handleSave} />
      </StyledButtonContainer>
    </StyledResetReactflowStyles>
  );
};
