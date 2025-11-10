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
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import { Tag, type TagColor } from 'twenty-ui/components';
import { Button } from 'twenty-ui/input';

import { ChatbotActionMenu } from '@/chatbot/components/actions/ChatbotActionMenu';
import {
  initialEdges,
  initialNodes,
} from '@/chatbot/flow-templates/mockFlowTemplate';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { isChatbotActionMenuOpenState } from '@/chatbot/state/isChatbotActionMenuOpen';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useLingui } from '@lingui/react/macro';
import {
  IconAlertCircle,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconX,
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { chatbotFlowEdges, chatbotFlowNodes } from '../state/chatbotFlowState';
import { type GenericNode } from '../types/GenericNode';

type BotDiagramBaseProps = {
  nodeTypes: NodeTypes;
  tagColor: TagColor;
  tagText: string;
  chatbotStatus: 'ACTIVE' | 'DRAFT' | 'DISABLED';
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
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
  align-self: flex-end;
`;

const StyledButton = styled(Button)`
  height: 24px;
`;

const StyledActiveChatbotWarning = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  width: 100%;
  background-color: ${({ theme }) => theme.color.yellow20};
  color: ${({ theme }) => theme.background.primaryInverted};
  border: 1px dashed ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: center;
  z-index: 1000;
`;

const StyledWarningText = styled.p`
  display: flex;
  flex: 1;
  text-align: center;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  background-color: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.background.primaryInverted};
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing(2)};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.15);
  }
`;

const StyledFooter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(4)};
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const BotDiagramBase = ({
  nodeTypes,
  tagColor,
  tagText,
  chatbotStatus,
}: BotDiagramBaseProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { chatbotId } = useParams();

  const nodes = useRecoilValue(chatbotFlowNodes) ?? initialNodes;
  const edges = useRecoilValue(chatbotFlowEdges) ?? initialEdges;
  const setEdges = useSetRecoilState(chatbotFlowEdges);

  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const isChatbotActionMenuOpen = useRecoilValue(isChatbotActionMenuOpenState);
  const setIsChatbotActionMenuOpen = useSetRecoilState(
    isChatbotActionMenuOpenState,
  );
  const [chatbotActionMenuPosition, setChatbotActionMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [isViewportMode, setIsViewportMode] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(true);

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

  // Callback to update nodes and save with current edges atomically
  const updateNodesAndSave = useRecoilCallback(
    ({ set, snapshot }) =>
      async (newNodes: GenericNode[], shouldSave: boolean) => {
        set(chatbotFlowNodes, newNodes);
        if (shouldSave && chatbotId) {
          // Read current edges from snapshot atomically
          const currentEdges =
            (await snapshot.getPromise(chatbotFlowEdges)) ?? initialEdges;
          updateOneRecord({
            idToUpdate: chatbotId,
            updateOneRecordInput: {
              flowNodes: newNodes.map((node) => {
                const { selected, ...rest } = node;
                return rest;
              }),
              flowEdges: currentEdges,
            },
          }).catch(() => {
            enqueueErrorSnackBar({
              message: t`Your changes could not be saved. Please try again.`,
            });
          });
        }
      },
    [chatbotId, enqueueErrorSnackBar, t, updateOneRecord],
  );

  // Callback to update edges and save with current nodes atomically
  const updateEdgesAndSave = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        newEdges: Edge[],
        shouldSave: boolean,
        saveType: 'nodes' | 'edges',
      ) => {
        set(chatbotFlowEdges, newEdges);
        if (shouldSave && chatbotId && rfInstance) {
          // Read current nodes from snapshot atomically
          const currentNodes =
            (await snapshot.getPromise(chatbotFlowNodes)) ?? initialNodes;
          updateOneRecord({
            idToUpdate: chatbotId,
            updateOneRecordInput: {
              flowNodes: currentNodes.map((node) => {
                const { selected, ...rest } = node;
                return rest;
              }),
              flowEdges: newEdges,
            },
          }).then(() => {
            enqueueInfoSnackBar({
              message: saveType === 'nodes' ? 'Nodes saved' : 'Edges saved',
            });
          });
        }
      },
    [chatbotId, enqueueInfoSnackBar, updateOneRecord, rfInstance],
  );

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
    (changes: NodeChange[]) => {
      const currentNodes = nodes ?? initialNodes;
      const currentEdges = edges ?? initialEdges;

      /* @kvoip-woulz proprietary:begin */
      // Check if we're deleting a start node
      const removeChanges = changes.filter(
        (change) => change.type === 'remove',
      );
      let finalNodes = applyNodeChanges(
        structuredClone(changes),
        structuredClone(currentNodes),
      );

      if (removeChanges.length > 0) {
        for (const removeChange of removeChanges) {
          if (removeChange.type === 'remove') {
            const nodeToDelete = currentNodes.find(
              (node) => node.id === removeChange.id,
            );
            const isDeletingStartNode = nodeToDelete?.data?.nodeStart === true;

            if (isDeletingStartNode && finalNodes.length > 0) {
              // Find the first node connected to the deleted start node
              const outgoingEdges = currentEdges.filter(
                (edge) => edge.source === removeChange.id,
              );
              let nextStartNode: (typeof finalNodes)[0] | undefined;

              if (outgoingEdges.length > 0) {
                const firstConnectedNodeId = outgoingEdges[0].target;
                nextStartNode = finalNodes.find(
                  (node) => node.id === firstConnectedNodeId,
                );
              }

              // Use the first connected node if found, otherwise use the first node in the array
              const newStartNode = nextStartNode ?? finalNodes[0];

              finalNodes = finalNodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  nodeStart: node.id === newStartNode.id,
                },
              }));
            }
          }
        }
      }
      /* @kvoip-woulz proprietary:end */

      const shouldSave = changes.some(
        (change) =>
          (change.type === 'position' && !change.dragging) ||
          change.type === 'remove',
      );
      updateNodesAndSave(finalNodes, shouldSave);
    },
    [nodes, edges, updateNodesAndSave],
  );

  const onEdgesChange = useCallback(
    (newEdgesState: EdgeChange[]) => {
      const currentEdges = edges ?? initialEdges;
      const appliedEdgeChanges = applyEdgeChanges(
        structuredClone(newEdgesState),
        structuredClone(currentEdges),
      );
      updateEdgesAndSave(appliedEdgeChanges, !!rfInstance, 'edges');
    },
    [edges, rfInstance, updateEdgesAndSave],
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
    setIsViewportMode((prev) => {
      const newMode = !prev;
      // Center the viewport when toggling
      if (reactFlow.viewportInitialized) {
        setTimeout(() => {
          reactFlow.fitView({ padding: 0.2, duration: 0 });
        }, 0);
      }
      return newMode;
    });
  }, [reactFlow]);

  return (
    <StyledResetReactflowStyles
      ref={containerRef}
      $isViewportMode={isViewportMode}
    >
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
        <Controls position="top-right" />
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
      <StyledFooter>
        <StyledButtonContainer>
          <StyledButton
            Icon={isViewportMode ? IconArrowsMinimize : IconArrowsMaximize}
            size="small"
            title={isViewportMode ? t`Restore` : t`Expand`}
            onClick={toggleViewportMode}
          />
          <StyledButton accent="blue" title={t`Save`} onClick={handleSave} />
        </StyledButtonContainer>
        {chatbotStatus === 'ACTIVE' && isWarningVisible && (
          <StyledActiveChatbotWarning>
            <StyledWarningText>
              <IconAlertCircle size={12} />
              {t`Be careful: you are editing an active chatbot. Some changes are saved automatically and may be reflected to your clients.`}
            </StyledWarningText>
            <StyledCloseButton
              onClick={() => setIsWarningVisible(false)}
              title={t`Close`}
            >
              <IconX size={12} />
            </StyledCloseButton>
          </StyledActiveChatbotWarning>
        )}
      </StyledFooter>
    </StyledResetReactflowStyles>
  );
};
