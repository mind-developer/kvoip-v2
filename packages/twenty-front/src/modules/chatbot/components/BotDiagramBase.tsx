/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramCustomMarkers';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
  type OnConnect,
  ReactFlow,
  type ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import { Tag, type TagColor } from 'twenty-ui/components';
import { Button, LightIconButton } from 'twenty-ui/input';

import { ChatbotActionMenu } from '@/chatbot/components/actions/ChatbotActionMenu';
import {
  initialEdges,
  initialNodes,
} from '@/chatbot/flow-templates/mockFlowTemplate';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { isChatbotActionMenuOpenState } from '@/chatbot/state/isChatbotActionMenuOpen';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { chatbotFlowEdges, chatbotFlowNodes } from '../state/chatbotFlowState';
import { type GenericNode } from '../types/GenericNode';

type BotDiagramBaseProps = {
  nodeTypes: NodeTypes;
  tagColor: TagColor;
  tagText: string;
};

const StyledResetReactflowStyles = styled.div<{ $isViewportMode: boolean }>`
  height: 100%;
  width: 100%;
  min-height: 600px;
  position: relative;

  ${({ $isViewportMode }) =>
    $isViewportMode &&
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    min-height: 100vh;
  `}

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

  .react-flow__attribution {
    display: none;
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
  bottom: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
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

  const { enqueueInfoSnackBar } = useSnackBar();

  const isChatbotActionMenuOpen = useRecoilValue(isChatbotActionMenuOpenState);
  const setIsChatbotActionMenuOpen = useSetRecoilState(
    isChatbotActionMenuOpenState,
  );
  const [chatbotActionMenuPosition, setChatbotActionMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [isViewportMode, setIsViewportMode] = useState(false);

  const reactFlow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    GenericNode,
    Edge
  > | null>(null);

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
          flowNodes: newFlow.nodes.map((node) => {
            const { selected, ...rest } = node;
            return rest;
          }),
          flowEdges: newFlow.edges,
          viewport: newFlow.viewport,
        },
      });
    }
  }, [rfInstance]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => {
        const appliedNodeChanges = applyNodeChanges(
          structuredClone(changes),
          structuredClone(nds ?? initialNodes),
        );
        if (
          changes.some(
            (change) => change.type === 'position' && !change.dragging,
          )
        ) {
          // Include edges when saving node positions to prevent losing connections
          setEdges((currentEdges) => {
            const edgesToSave = currentEdges ?? edges ?? initialEdges;
            updateOneRecord({
              idToUpdate: chatbotId ?? '',
              updateOneRecordInput: {
                flowNodes: appliedNodeChanges.map((node) => {
                  const { selected, ...rest } = node;
                  return rest;
                }),
                flowEdges: edgesToSave,
              },
            }).then(() => {
              enqueueInfoSnackBar({
                message: 'Nodes saved',
              });
            });
            return currentEdges;
          });
        }
        return appliedNodeChanges;
      }),
    [chatbotId, enqueueInfoSnackBar, edges, setEdges],
  );

  const onEdgesChange = useCallback(
    (newEdgesState: EdgeChange[]) =>
      setEdges((eds: Edge[]) => {
        const appliedEdgeChanges = applyEdgeChanges(
          structuredClone(newEdgesState),
          structuredClone(eds ?? initialEdges),
        );
        if (rfInstance) {
          // Include nodes when saving edges to prevent losing node data
          setNodes((currentNodes) => {
            const nodesToSave = currentNodes ?? nodes ?? initialNodes;
            updateOneRecord({
              idToUpdate: chatbotId ?? '',
              updateOneRecordInput: {
                flowNodes: nodesToSave.map((node) => {
                  const { selected, ...rest } = node;
                  return rest;
                }),
                flowEdges: appliedEdgeChanges,
              },
            }).then(() => {
              enqueueInfoSnackBar({
                message: 'Nodes saved',
              });
            });
            return currentNodes;
          });
        }
        return appliedEdgeChanges;
      }),
    [enqueueInfoSnackBar, rfInstance, chatbotId, nodes, setNodes],
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
    setChatbotActionMenuPosition({ x: e.clientX, y: e.clientY });
    setIsChatbotActionMenuOpen(true);
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

  const toggleViewportMode = useCallback(() => {
    setIsViewportMode((prev) => !prev);
  }, []);

  return (
    <StyledResetReactflowStyles ref={containerRef} $isViewportMode={isViewportMode}>
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
          setIsChatbotActionMenuOpen(false);
          setChatbotFlowSelectedNode([]);
        }}
        onDragStart={() => setIsChatbotActionMenuOpen(false)}
        onNodeClick={(event, node) => {
          event.stopPropagation();
          setChatbotFlowSelectedNode([node]);
          setIsChatbotActionMenuOpen(false);
        }}
        onContextMenu={handleContextMenu}
        multiSelectionKeyCode={'shift'}
      >
        <Controls />
        <Background bgColor={theme.background.primary} size={2} />
      </ReactFlow>

      <StyledStatusTagContainer data-testid={'tagContainerBotDiagram'}>
        <Tag color={tagColor} text={tagText} />
      </StyledStatusTagContainer>

      {isChatbotActionMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: chatbotActionMenuPosition.y,
            left: chatbotActionMenuPosition.x,
            zIndex: isViewportMode ? 10000 : 1000,
          }}
        >
          <ChatbotActionMenu cursorPosition={chatbotActionMenuPosition} />
        </div>
      )}

      <StyledButtonContainer>
        <LightIconButton
          Icon={isViewportMode ? IconMinimize : IconMaximize}
          accent="tertiary"
          size="small"
          title={isViewportMode ? 'Restaurar' : 'Expandir para viewport'}
          onClick={toggleViewportMode}
        />
        <StyledButton accent="blue" title="Save" onClick={handleSave} />
      </StyledButtonContainer>
    </StyledResetReactflowStyles>
  );
};
