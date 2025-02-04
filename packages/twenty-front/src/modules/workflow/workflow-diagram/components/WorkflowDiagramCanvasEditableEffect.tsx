import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';

import { workflowIdState } from '@/workflow/states/workflowIdState';
import { EMPTY_TRIGGER_STEP_ID } from '@/workflow/workflow-diagram/constants/EmptyTriggerStepId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { startNodeCreation } = useStartNodeCreation();

  const {
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowEditStepInCommandMenu,
  } = useCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowId = useRecoilValue(workflowIdState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode | undefined;

      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      if (!isDefined(selectedNode)) {
        return;
      }

      const isEmptyTriggerNode = selectedNode.type === EMPTY_TRIGGER_STEP_ID;
      if (isEmptyTriggerNode) {
        openRightDrawer(RightDrawerPages.WorkflowStepSelectTriggerType);

        return;
      }

      if (isCreateStepNode(selectedNode)) {
        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      setWorkflowSelectedNode(selectedNode.id);
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepEdit);
    },
    [
      isInRightDrawer,
      setCommandMenuNavigationStack,
      workflowId,
      openWorkflowTriggerTypeInCommandMenu,
      startNodeCreation,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
